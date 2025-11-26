import { PrismaService } from 'src/modules/prisma/application/services/prisma.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateParticipationRegisterDto } from '../../application/dto/create-participation-register.dto';
import { ParticipationRegister } from '../../domain/entities/participation-register.entity';
import { CreateSubscriptionRegisterDto } from '../../application/dto/create-subscription-register.dto';
import { SubscriptionRegister } from '../../domain/entities/subsciption-register.entity';
import { CreateProposalRegisterDto } from '../../application/dto/create-proposal-register.dto';
import { ProposalRegisterDetail } from '../../domain/entities';
import { InputJsonValue } from '@prisma/client/runtime/binary';
import { CreateRegistrationDto } from '../../application/dto/create-registration.dto';

@Injectable()
export class RegisterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createParticipation(
    createParticipationRegisterDto: CreateParticipationRegisterDto,
  ): Promise<ParticipationRegister> {
    const {
      userId,
      simiEventCode,
      participationMechanismId,
      type,
      date,
      hour,
      place,
      topic,
      specializedProfessional,
      coordinator,
      members,
      speakers,
      description,
      ...participationRegister
    } = createParticipationRegisterDto;

    this.validateEvent(createParticipationRegisterDto);

    const participationRegisterEntity = await this.prisma.$transaction(async (tx) => {
      const existingEvent = await tx.event.findFirst({
        where: {
          simiEventCode: simiEventCode || '',
          status: true,
        },
      });

      const eventData = {
        simiEventCode: simiEventCode || '',
        type: type || '',
        description: description || '',
        date: date || new Date(),
        hour: hour || '',
        place: place || '',
        topic: topic || '',
        specializedProfessional,
        coordinator,
        members: members as unknown as InputJsonValue,
        speakers: speakers as unknown as string[],
        status: true,
      };

      const event = existingEvent
        ? await tx.event.update({
            where: { id: existingEvent.id },
            data: eventData,
          })
        : await tx.event.create({
            data: eventData,
          });

      const participationRegisterEntity = await tx.participationRegister.create({
        data: {
          ...participationRegister,
          simiEventCode: simiEventCode || '',
          registration: {
            create: { userId, participationMechanismId, eventId: event.id, simiEventCode: simiEventCode || '' },
          },
        },
        include: {
          registration: {
            include: {
              participationMechanism: true,
              event: true,
              user: {
                include: {
                  userType: true,
                  documentType: true,
                  dependency: true,
                },
              },
            },
          },
        },
      });
      return participationRegisterEntity;
    });
    return ParticipationRegister.fromPrisma(participationRegisterEntity);
  }

  async createSubscription(
    createSubscriptionRegisterDto: CreateSubscriptionRegisterDto & { topic: string },
  ): Promise<SubscriptionRegister> {
    const { userId, participationMechanismId, simiTopicId, topic } = createSubscriptionRegisterDto;

    const subscriptionRegisterEntity = await this.prisma.subscriptionRegister.create({
      data: {
        simiTopicId,
        topic,
        registration: {
          create: {
            userId,
            participationMechanismId,
            simiEventCode: null,
            eventId: null,
          },
        },
      },
      include: {
        registration: {
          include: {
            participationMechanism: true,
            event: true,
            user: {
              include: {
                userType: true,
                documentType: true,
                dependency: true,
              },
            },
          },
        },
      },
    });

    return SubscriptionRegister.fromPrisma(subscriptionRegisterEntity);
  }

  async deleteSubscription(subscriptionId: number): Promise<void> {
    const subscriptionRegister = await this.prisma.subscriptionRegister.findUnique({
      where: { id: subscriptionId },
      include: {
        registration: {
          include: {
            SubscriptionRegister: true,
            ParticipationRegister: true,
            ProposalRegister: true,
          },
        },
      },
    });

    if (!subscriptionRegister) {
      throw new NotFoundException(`No se encontró la suscripción con id ${subscriptionId}`);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.subscriptionRegister.delete({
        where: { id: subscriptionId },
      });

      const registration = subscriptionRegister.registration;
      const hasOtherSubscriptions = registration.SubscriptionRegister.length > 1;
      const hasParticipations = registration.ParticipationRegister.length > 0;
      const hasProposals = registration.ProposalRegister.length > 0;

      if (!hasOtherSubscriptions && !hasParticipations && !hasProposals) {
        await tx.registration.delete({
          where: { id: registration.id },
        });
      }
    });
  }

  async createProposal(createProposalRegisterDto: CreateProposalRegisterDto): Promise<ProposalRegisterDetail> {
    const { userId, simiEventCode, participationMechanismId, cites, politicalTopic, politicalTopicJustification } =
      createProposalRegisterDto;

    const proposalStatus = await this.prisma.proposalStatus.findFirst({
      where: {
        name: 'Creada',
      },
    });

    if (!proposalStatus) {
      throw new NotFoundException('Proposal status not found');
    }

    const proposalRegisterEntity = await this.prisma.proposalRegister.create({
      data: {
        simiEventCode: simiEventCode || '',
        politicalTopic,
        politicalTopicJustification,
        RegistrationCite: {
          create: cites.map((cite) => ({
            userId: cite.userId,
            CiteQuestion: {
              create: cite.questions.map((question) => ({
                question: question.question,
              })),
            },
          })),
        },
        proposalStatus: {
          connect: {
            id: proposalStatus.id,
          },
        },
        registration: {
          create: {
            userId,
            participationMechanismId,
            simiEventCode: simiEventCode || '',
          },
        },
      },
      include: {
        registration: {
          include: {
            participationMechanism: true,
            user: {
              include: {
                userType: true,
                documentType: true,
                dependency: true,
              },
            },
          },
        },
        RegistrationCite: {
          include: {
            user: {
              include: {
                userType: true,
                documentType: true,
                dependency: true,
              },
            },
            CiteQuestion: true,
          },
        },
        proposalStatus: true,
      },
    });

    return ProposalRegisterDetail.fromPrisma(proposalRegisterEntity);
  }

  async existRegistration(userId: number, participationMechanismId: number): Promise<boolean> {
    const registration = await this.prisma.registration.findFirst({
      where: {
        userId,
        participationMechanismId,
      },
    });
    return registration ? true : false;
  }

  async existRegistrationForEvent(userId: number, simiEventCode: string): Promise<boolean> {
    const registration = await this.prisma.registration.findFirst({
      where: {
        userId,
        simiEventCode,
      },
    });
    return registration ? true : false;
  }

  async existParticipationRegisterWithOwnUser(userId: number, simiEventCode: string): Promise<boolean> {
    const registration = await this.prisma.registration.findFirst({
      where: {
        userId,
        simiEventCode,
        ParticipationRegister: {
          some: {
            ownUser: true,
          },
        },
      },
    });
    return registration ? true : false;
  }

  async existParticipationRegisterWithOrganizationEmail(
    organizationEmail: string,
    simiEventCode: string,
  ): Promise<boolean> {
    const registration = await this.prisma.registration.findFirst({
      where: {
        simiEventCode,
        ParticipationRegister: {
          some: {
            ownUser: false,
            organizationEmail,
          },
        },
      },
    });
    return registration ? true : false;
  }

  async existActiveEvent(simiEventCode: string): Promise<boolean> {
    const event = await this.prisma.event.findFirst({
      where: {
        simiEventCode,
        status: true,
      },
    });
    return event ? true : false;
  }

  async existSubscriptionRegister(userId: number, simiTopicId: string): Promise<boolean> {
    const subscriptionRegister = await this.prisma.subscriptionRegister.findFirst({
      where: {
        simiTopicId,
        registration: {
          userId,
        },
      },
    });
    return subscriptionRegister ? true : false;
  }

  validateEvent(createRegistrationDto: CreateRegistrationDto): void {
    const { simiEventCode, description, date, hour, place } = createRegistrationDto;

    if (!simiEventCode) throw new BadRequestException('El código del evento simi es requerido');

    if (!description) throw new BadRequestException('La descripción del evento es requerida');

    if (!date) throw new BadRequestException('La fecha del evento es requerida');

    if (!hour) throw new BadRequestException('La hora del evento es requerida');

    if (!place) throw new BadRequestException('El lugar del evento es requerido');
  }

  async answerCiteQuestion(
    citeQuestionId: number,
    answer: string,
    userId: number,
  ): Promise<{
    citeQuestion: {
      id: number;
      question: string;
      answer: string;
      answeredAt: Date;
      registrationCite: {
        user: {
          id: number;
          firstName: string;
          lastName: string | null;
          email: string;
          dependency: {
            name: string;
          } | null;
        };
        proposalRegister: {
          id: number;
          simiEventCode: string | null;
          politicalTopic: string | null;
          registration: {
            user: {
              id: number;
              firstName: string;
              lastName: string | null;
              email: string;
            };
          };
        };
      };
    };
  }> {
    const citeQuestion = await this.prisma.citeQuestion.findUnique({
      where: { id: citeQuestionId },
      include: {
        registrationCite: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                dependency: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            proposalRegister: {
              include: {
                proposalStatus: true,
                registration: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!citeQuestion) {
      throw new NotFoundException('Pregunta de cita no encontrada');
    }

    if (citeQuestion.registrationCite.userId !== userId) {
      throw new BadRequestException('Solo puedes responder preguntas de tus propias citaciones');
    }

    if (citeQuestion.registrationCite.proposalRegister.proposalStatus.name === 'Rechazada') {
      throw new BadRequestException('No se pueden responder preguntas de propuestas rechazadas');
    }

    const updatedCiteQuestion = await this.prisma.citeQuestion.update({
      where: { id: citeQuestionId },
      data: {
        answer,
        answeredAt: new Date(),
      },
      include: {
        registrationCite: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                dependency: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            proposalRegister: {
              include: {
                registration: {
                  include: {
                    user: {
                      select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      citeQuestion: {
        id: updatedCiteQuestion.id,
        question: updatedCiteQuestion.question,
        answer: updatedCiteQuestion.answer || '',
        answeredAt: updatedCiteQuestion.answeredAt || new Date(),
        registrationCite: {
          user: {
            ...updatedCiteQuestion.registrationCite.user,
            dependency: updatedCiteQuestion.registrationCite.user.dependency,
          },
          proposalRegister: {
            id: updatedCiteQuestion.registrationCite.proposalRegister.id,
            simiEventCode: updatedCiteQuestion.registrationCite.proposalRegister.simiEventCode,
            politicalTopic: updatedCiteQuestion.registrationCite.proposalRegister.politicalTopic,
            registration: {
              user: updatedCiteQuestion.registrationCite.proposalRegister.registration.user,
            },
          },
        },
      },
    };
  }

  async changeProposalStatus(proposalRegisterId: number, proposalStatusId: number): Promise<void> {
    const proposalRegister = await this.prisma.proposalRegister.findUnique({
      where: { id: proposalRegisterId },
    });

    if (!proposalRegister) {
      throw new NotFoundException('Propuesta ciudadana no encontrada');
    }

    const proposalStatus = await this.prisma.proposalStatus.findUnique({
      where: { id: proposalStatusId },
    });

    if (!proposalStatus) {
      throw new NotFoundException('Estado de propuesta no encontrado');
    }

    await this.prisma.proposalRegister.update({
      where: { id: proposalRegisterId },
      data: {
        proposalStatusId,
        updatedAt: new Date(),
      },
    });
  }

  async findParticipationRegisterById(participationRegisterId: number): Promise<ParticipationRegister | null> {
    const participationRegister = await this.prisma.participationRegister.findUnique({
      where: { id: participationRegisterId },
      include: {
        registration: {
          include: {
            participationMechanism: true,
            event: true,
            user: {
              include: {
                userType: true,
                documentType: true,
                dependency: true,
              },
            },
          },
        },
      },
    });

    if (!participationRegister) {
      return null;
    }

    return ParticipationRegister.fromPrisma(participationRegister);
  }

  async deleteParticipation(participationRegisterId: number): Promise<ParticipationRegister> {
    const participationRegister = await this.prisma.participationRegister.findUnique({
      where: { id: participationRegisterId },
      include: {
        registration: {
          include: {
            participationMechanism: true,
            event: true,
            user: {
              include: {
                userType: true,
                documentType: true,
                dependency: true,
              },
            },
          },
        },
      },
    });

    if (!participationRegister) {
      throw new NotFoundException(`Registro de participación no encontrado con id ${participationRegisterId}`);
    }

    const participationRegisterEntity = ParticipationRegister.fromPrisma(participationRegister);

    await this.prisma.participationRegister.delete({
      where: { id: participationRegisterId },
    });

    return participationRegisterEntity;
  }

  async findSubscriptionById(subscriptionId: number): Promise<SubscriptionRegister | null> {
    const subscriptionRegister = await this.prisma.subscriptionRegister.findUnique({
      where: { id: subscriptionId },
      include: {
        registration: {
          include: {
            participationMechanism: true,
            event: true,
            user: {
              include: {
                userType: true,
                documentType: true,
                dependency: true,
              },
            },
          },
        },
      },
    });

    if (!subscriptionRegister) {
      return null;
    }

    return SubscriptionRegister.fromPrisma(subscriptionRegister);
  }
}
