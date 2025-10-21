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
      const activeEvent = await this.existActiveEvent(simiEventCode!);

      let event;

      if (!activeEvent) {
        event = await tx.event.create({
          data: {
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
          },
        });
      } else {
        event = await tx.event.findFirst({
          where: {
            simiEventCode: simiEventCode || '',
            status: true,
          },
        });
      }

      const participationRegisterEntity = await tx.participationRegister.create({
        data: {
          ...participationRegister,
          simiEventCode: simiEventCode || '',
          registration: {
            create: { userId, participationMechanismId, eventId: event!.id, simiEventCode: simiEventCode || '' },
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
        },
      });
      return participationRegisterEntity;
    });
    return ParticipationRegister.fromPrisma(participationRegisterEntity);
  }

  async createSubscription(
    createSubscriptionRegisterDto: CreateSubscriptionRegisterDto,
  ): Promise<SubscriptionRegister> {
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
      ...subscriptionRegister
    } = createSubscriptionRegisterDto;

    this.validateEvent(createSubscriptionRegisterDto);

    const subscriptionRegisterEntity = await this.prisma.$transaction(async (tx) => {
      const activeEvent = await this.existActiveEvent(simiEventCode!);

      let event;

      if (!activeEvent) {
        event = await tx.event.create({
          data: {
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
          },
        });
      } else {
        event = await tx.event.findFirst({
          where: {
            simiEventCode: simiEventCode || '',
            status: true,
          },
        });
      }

      const subscriptionRegisterEntity = await tx.subscriptionRegister.create({
        data: {
          ...subscriptionRegister,
          simiEventCode: simiEventCode || '',
          registration: {
            create: { userId, participationMechanismId, eventId: event!.id, simiEventCode: simiEventCode || '' },
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
        },
      });
      return subscriptionRegisterEntity;
    });
    return SubscriptionRegister.fromPrisma(subscriptionRegisterEntity);
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
            userId,
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

  validateEvent(createRegistrationDto: CreateRegistrationDto): void {
    const { simiEventCode, description, date, hour, place } = createRegistrationDto;

    if (!simiEventCode) throw new BadRequestException('El código del evento simi es requerido');

    if (!description) throw new BadRequestException('La descripción del evento es requerida');

    if (!date) throw new BadRequestException('La fecha del evento es requerida');

    if (!hour) throw new BadRequestException('La hora del evento es requerida');

    if (!place) throw new BadRequestException('El lugar del evento es requerido');
  }
}
