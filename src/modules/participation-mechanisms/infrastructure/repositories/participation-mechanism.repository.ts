import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/application/services/prisma.service';
import { ParticipationMechanism } from '../../domain/entities/participation-mechanism.entity';
import { Event } from '../../domain/entities/event.entity';
import { GetEventsDto } from '../../application/dto/get-events.dto';
import { GetEventRegisteredUsersDto } from '../../application/dto/get-event-registered-users.dto';
import { GetProposalsDto, GetProposalsByCitationsDto } from '../../application/dto';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { PaginationUtil } from 'src/modules/common/infrastructure/utils/pagination.util';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';
import { EventRegisteredUser } from '../../domain/entities/event-registered-user.entity';
import { AllEventsRegisteredUser } from '../../domain/entities/all-events-registered-user.entity';
import { ProposalRegister } from '../../domain/entities/proposal-register.entity';

@Injectable()
export class ParticipationMechanismRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginationUtil: PaginationUtil,
  ) {}

  async findOneById(id: number): Promise<ParticipationMechanism> {
    const participationMechanism = await this.prisma.participationMechanism.findFirst({ where: { id, status: true } });
    if (!participationMechanism) throw new NotFoundException(`Mecanismo de participación no encontrado con id ${id}`);
    return ParticipationMechanism.fromPrisma(participationMechanism);
  }

  async getAll(): Promise<ParticipationMechanism[]> {
    const participationMechanisms = await this.prisma.participationMechanism.findMany({
      where: { status: true },
      orderBy: { id: 'asc' },
    });
    return participationMechanisms.map((participationMechanism) =>
      ParticipationMechanism.fromPrisma(participationMechanism),
    );
  }

  async findOneByType(type: string): Promise<ParticipationMechanism> {
    const participationMechanism = await this.prisma.participationMechanism.findFirst({
      where: { type, status: true },
    });
    if (!participationMechanism)
      throw new NotFoundException(`Mecanismo de participación no encontrado con tipo ${type}`);
    return ParticipationMechanism.fromPrisma(participationMechanism);
  }

  async getEventById(id: number): Promise<Event> {
    const event = await this.prisma.event.findFirst({
      where: { id },
    });
    if (!event) throw new NotFoundException(`Event not found with id ${id}`);
    return Event.fromPrisma(event);
  }

  async getEventBySimiCode(simiEventCode: string): Promise<Event> {
    const event = await this.prisma.event.findFirst({
      where: { simiEventCode },
    });
    if (!event) throw new NotFoundException(`Event not found with SIMI code ${simiEventCode}`);
    return Event.fromPrisma(event);
  }

  async getAllEvents(getEventsDto: GetEventsDto): Promise<PaginationType<Event>> {
    const orderBy = getEventsDto.orderBy ?? 'date';
    const orderDirection = getEventsDto.orderDirection ?? 'asc';

    const whereCondition = {
      ...(getEventsDto.type && { type: getEventsDto.type }),
      ...(getEventsDto.search && {
        OR: [
          { simiEventCode: { contains: getEventsDto.search, mode: 'insensitive' as const } },
          { description: { contains: getEventsDto.search, mode: 'insensitive' as const } },
          { place: { contains: getEventsDto.search, mode: 'insensitive' as const } },
          { topic: { contains: getEventsDto.search, mode: 'insensitive' as const } },
          { specializedProfessional: { contains: getEventsDto.search, mode: 'insensitive' as const } },
          { coordinator: { contains: getEventsDto.search, mode: 'insensitive' as const } },
        ],
      }),
      ...(getEventsDto.userId && {
        Registration: {
          some: {
            userId: getEventsDto.userId,
          },
        },
      }),
    };

    return this.paginationUtil.getPaginatedPrismaData<Event>({
      paginationDto: getEventsDto,
      prismaQuery: () =>
        this.prisma.event
          .findMany({
            where: whereCondition,
            ...this.paginationUtil.getSkipAndTake(getEventsDto),
            orderBy: {
              [orderBy]: orderDirection,
            },
          })
          .then((events) => events.map((event) => Event.fromPrisma(event))),
      countQuery: () =>
        this.prisma.event.count({
          where: whereCondition,
        }),
    });
  }

  async getEventRegisteredUsers(
    eventId: number,
    getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<EventRegisteredUser[]> {
    const participationRegisters = await this.prisma.participationRegister.findMany({
      where: {
        registration: {
          eventId: eventId,
          user: {},
        },
        ...(getEventRegisteredUsersDto.search && {
          OR: [
            {
              registration: {
                user: {
                  OR: [
                    { firstName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                    { lastName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                    { email: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                    { documentNumber: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                  ],
                },
              },
            },
            {
              organizationName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
            },
            {
              organizationNit: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
            },
            {
              organizationEmail: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
            },
            {
              organizationRole: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
            },
          ],
        }),
      },
      select: {
        id: true,
        simiEventCode: true,
        ownUser: true,
        organizationName: true,
        organizationNit: true,
        organizationEmail: true,
        organizationRole: true,
        createdAt: true,
        registration: {
          select: {
            eventId: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                documentNumber: true,
                phoneNumber: true,
                userType: true,
                documentType: true,
                dependency: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (participationRegisters.length === 0) {
      const eventExists = await this.prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true },
      });

      if (!eventExists) {
        throw new NotFoundException(`Event not found with id ${eventId}`);
      }
    }

    return participationRegisters.map((participationRegister) => {
      const eventRegisteredUser = new EventRegisteredUser();
      Object.assign(eventRegisteredUser, {
        id: participationRegister.id,
        userId: participationRegister.registration.user.id,
        firstName: participationRegister.registration.user.firstName,
        lastName: participationRegister.registration.user.lastName || null,
        email: participationRegister.registration.user.email,
        documentNumber: participationRegister.registration.user.documentNumber,
        phoneNumber: participationRegister.registration.user.phoneNumber,
        userType: participationRegister.registration.user.userType,
        documentType: participationRegister.registration.user.documentType,
        dependency: participationRegister.registration.user.dependency || null,
        ownUser: participationRegister.ownUser,
        organizationName: participationRegister.organizationName || null,
        organizationNit: participationRegister.organizationNit || null,
        organizationEmail: participationRegister.organizationEmail || null,
        organizationRole: participationRegister.organizationRole || null,
        simiEventCode: participationRegister.simiEventCode,
        registrationDate: participationRegister.createdAt,
      });
      return eventRegisteredUser;
    });
  }

  async getAllEventsRegisteredUsersNoPagination(
    getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<AllEventsRegisteredUser[]> {
    const whereCondition = {
      registration: {
        eventId: { not: null },
        user: {},
        ...(getEventRegisteredUsersDto.participationMechanismId && {
          participationMechanismId: getEventRegisteredUsersDto.participationMechanismId,
        }),
      },
      ...(getEventRegisteredUsersDto.search && {
        OR: [
          {
            registration: {
              user: {
                OR: [
                  { firstName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                  { lastName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                  { email: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                  { documentNumber: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                ],
              },
            },
          },
          {
            organizationName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
          },
          {
            organizationNit: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
          },
          {
            organizationEmail: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
          },
          {
            organizationRole: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
          },
        ],
      }),
    };

    const participationRegisters = await this.prisma.participationRegister.findMany({
      where: whereCondition,
      select: {
        id: true,
        simiEventCode: true,
        ownUser: true,
        organizationName: true,
        organizationNit: true,
        organizationEmail: true,
        organizationRole: true,
        createdAt: true,
        registration: {
          select: {
            eventId: true,
            event: {
              select: {
                simiEventCode: true,
                description: true,
              },
            },
            participationMechanism: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                documentNumber: true,
                phoneNumber: true,
                userType: true,
                documentType: true,
                dependency: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return participationRegisters.map((participationRegister) => {
      const allEventsRegisteredUser = new AllEventsRegisteredUser();
      Object.assign(allEventsRegisteredUser, {
        id: participationRegister.id,
        eventId: participationRegister.registration.eventId || 0,
        participationName: participationRegister.registration.participationMechanism?.name || '',
        eventSimiEventCode: participationRegister.registration.event?.simiEventCode || '',
        eventDescription: participationRegister.registration.event?.description || '',
        userId: participationRegister.registration.user.id,
        firstName: participationRegister.registration.user.firstName,
        lastName: participationRegister.registration.user.lastName || null,
        email: participationRegister.registration.user.email,
        documentNumber: participationRegister.registration.user.documentNumber,
        phoneNumber: participationRegister.registration.user.phoneNumber,
        userType: participationRegister.registration.user.userType,
        documentType: participationRegister.registration.user.documentType,
        dependency: participationRegister.registration.user.dependency || null,
        ownUser: participationRegister.ownUser,
        organizationName: participationRegister.organizationName || null,
        organizationNit: participationRegister.organizationNit || null,
        organizationEmail: participationRegister.organizationEmail || null,
        organizationRole: participationRegister.organizationRole || null,
        simiEventCode: participationRegister.simiEventCode,
        registrationDate: participationRegister.createdAt,
      });
      return allEventsRegisteredUser;
    });
  }

  async getAllEventsRegisteredUsers(
    getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<PaginationType<AllEventsRegisteredUser>> {
    const whereCondition = {
      registration: {
        eventId: { not: null },
        user: {},
        ...(getEventRegisteredUsersDto.participationMechanismId && {
          participationMechanismId: getEventRegisteredUsersDto.participationMechanismId,
        }),
      },
      ...(getEventRegisteredUsersDto.search && {
        OR: [
          {
            registration: {
              user: {
                OR: [
                  { firstName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                  { lastName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                  { email: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                  { documentNumber: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const } },
                ],
              },
            },
          },
          {
            organizationName: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
          },
          {
            organizationNit: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
          },
          {
            organizationEmail: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
          },
          {
            organizationRole: { contains: getEventRegisteredUsersDto.search, mode: 'insensitive' as const },
          },
        ],
      }),
    };

    return this.paginationUtil.getPaginatedPrismaData<AllEventsRegisteredUser>({
      paginationDto: getEventRegisteredUsersDto,
      prismaQuery: async () => {
        const participationRegisters = await this.prisma.participationRegister.findMany({
          where: whereCondition,
          ...this.paginationUtil.getSkipAndTake(getEventRegisteredUsersDto),
          select: {
            id: true,
            simiEventCode: true,
            ownUser: true,
            organizationName: true,
            organizationNit: true,
            organizationEmail: true,
            organizationRole: true,
            createdAt: true,
            registration: {
              select: {
                eventId: true,
                event: {
                  select: {
                    simiEventCode: true,
                    description: true,
                  },
                },
                participationMechanism: {
                  select: {
                    name: true,
                  },
                },
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    documentNumber: true,
                    phoneNumber: true,
                    userType: true,
                    documentType: true,
                    dependency: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        return participationRegisters.map((participationRegister) => {
          const allEventsRegisteredUser = new AllEventsRegisteredUser();
          Object.assign(allEventsRegisteredUser, {
            id: participationRegister.id,
            eventId: participationRegister.registration.eventId || 0,
            participationName: participationRegister.registration.participationMechanism?.name || '',
            eventSimiEventCode: participationRegister.registration.event?.simiEventCode || '',
            eventDescription: participationRegister.registration.event?.description || '',
            userId: participationRegister.registration.user.id,
            firstName: participationRegister.registration.user.firstName,
            lastName: participationRegister.registration.user.lastName || null,
            email: participationRegister.registration.user.email,
            documentNumber: participationRegister.registration.user.documentNumber,
            phoneNumber: participationRegister.registration.user.phoneNumber,
            userType: participationRegister.registration.user.userType,
            documentType: participationRegister.registration.user.documentType,
            dependency: participationRegister.registration.user.dependency || null,
            ownUser: participationRegister.ownUser,
            organizationName: participationRegister.organizationName || null,
            organizationNit: participationRegister.organizationNit || null,
            organizationEmail: participationRegister.organizationEmail || null,
            organizationRole: participationRegister.organizationRole || null,
            simiEventCode: participationRegister.simiEventCode,
            registrationDate: participationRegister.createdAt,
          });
          return allEventsRegisteredUser;
        });
      },
      countQuery: () =>
        this.prisma.participationRegister.count({
          where: whereCondition,
        }),
    });
  }

  async getAllProposals(getProposalsDto: GetProposalsDto): Promise<PaginationType<ProposalRegister>> {
    const orderBy = getProposalsDto.orderBy ?? 'createdAt';
    const orderDirection = getProposalsDto.orderDirection ?? 'desc';

    const whereCondition = {
      ...(getProposalsDto.proposalStatusId && { proposalStatusId: getProposalsDto.proposalStatusId }),
      ...(getProposalsDto.search && {
        OR: [
          { simiEventCode: { contains: getProposalsDto.search, mode: 'insensitive' as const } },
          { politicalTopic: { contains: getProposalsDto.search, mode: 'insensitive' as const } },
          {
            politicalTopicJustification: {
              contains: getProposalsDto.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
      ...(getProposalsDto.userId && {
        registration: {
          userId: getProposalsDto.userId,
        },
      }),
    };

    return this.paginationUtil.getPaginatedPrismaData<ProposalRegister>({
      paginationDto: getProposalsDto,
      prismaQuery: () =>
        this.prisma.proposalRegister
          .findMany({
            where: whereCondition,
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
                      documentNumber: true,
                    },
                  },
                },
              },
            },
            ...this.paginationUtil.getSkipAndTake(getProposalsDto),
            orderBy: {
              [orderBy]: orderDirection,
            },
          })
          .then((proposals) => proposals.map((proposal) => ProposalRegister.fromPrisma(proposal))),
      countQuery: () =>
        this.prisma.proposalRegister.count({
          where: whereCondition,
        }),
    });
  }

  async getProposalsByUserCitations(
    userId: number,
    getProposalsByCitationsDto: GetProposalsByCitationsDto,
  ): Promise<PaginationType<ProposalRegister>> {
    const orderBy = getProposalsByCitationsDto.orderBy ?? 'createdAt';
    const orderDirection = getProposalsByCitationsDto.orderDirection ?? 'desc';

    const whereCondition = {
      RegistrationCite: {
        some: {
          userId,
        },
      },
      ...(getProposalsByCitationsDto.proposalStatusId && {
        proposalStatusId: getProposalsByCitationsDto.proposalStatusId,
      }),
      ...(getProposalsByCitationsDto.search && {
        OR: [
          { simiEventCode: { contains: getProposalsByCitationsDto.search, mode: 'insensitive' as const } },
          { politicalTopic: { contains: getProposalsByCitationsDto.search, mode: 'insensitive' as const } },
          {
            politicalTopicJustification: {
              contains: getProposalsByCitationsDto.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    return this.paginationUtil.getPaginatedPrismaData<ProposalRegister>({
      paginationDto: getProposalsByCitationsDto,
      prismaQuery: () =>
        this.prisma.proposalRegister
          .findMany({
            where: whereCondition,
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
                      documentNumber: true,
                    },
                  },
                },
              },
            },
            ...this.paginationUtil.getSkipAndTake(getProposalsByCitationsDto as PaginationDto),
            orderBy: {
              [orderBy]: orderDirection,
            },
          })
          .then((proposals) => proposals.map((proposal) => ProposalRegister.fromPrisma(proposal))),
      countQuery: () =>
        this.prisma.proposalRegister.count({
          where: whereCondition,
        }),
    });
  }

  async getProposalById(id: number): Promise<ProposalRegister> {
    const proposal = await this.prisma.proposalRegister.findFirst({
      where: { id },
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
                documentNumber: true,
                phoneNumber: true,
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
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                documentNumber: true,
                dependency: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            CiteQuestion: true,
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal not found with id ${id}`);
    }

    return ProposalRegister.fromPrisma(proposal);
  }

  async deactivateEvent(simiEventCode: string, userId: number): Promise<void> {
    const event = await this.prisma.event.findFirst({
      where: { simiEventCode },
      include: {
        Registration: {
          include: {
            participationMechanism: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    if (!event.Registration || event.Registration.length === 0) {
      throw new NotFoundException('No se encontraron registros para este evento');
    }

    const participationMechanism = event.Registration[0].participationMechanism;
    const allowedMechanismIds = [1, 2, 3, 4, 6];
    if (!allowedMechanismIds.includes(participationMechanism.id)) {
      throw new BadRequestException('Solo se pueden desactivar eventos de participación ciudadana (IDs: 1,2,3,4,6)');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.simiInactiveEvent.create({
        data: {
          simiEventCode,
          userId,
        },
      });

      await tx.event.update({
        where: { id: event.id },
        data: { status: false },
      });
    });
  }

  async reactivateEvent(simiEventCode: string): Promise<void> {
    const inactiveEvent = await this.prisma.simiInactiveEvent.findFirst({
      where: { simiEventCode },
    });

    if (!inactiveEvent) {
      throw new NotFoundException('Evento inactivo no encontrado');
    }

    const event = await this.prisma.event.findFirst({
      where: { simiEventCode },
    });

    if (!event) {
      throw new NotFoundException('Evento no encontrado');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.simiInactiveEvent.delete({
        where: { id: inactiveEvent.id },
      });

      await tx.event.update({
        where: { id: event.id },
        data: { status: true },
      });
    });
  }

  async getInactiveSimiCodes(): Promise<string[]> {
    const inactiveEvents = await this.prisma.simiInactiveEvent.findMany({
      select: { simiEventCode: true },
    });

    return inactiveEvents.map((event) => event.simiEventCode);
  }
}
