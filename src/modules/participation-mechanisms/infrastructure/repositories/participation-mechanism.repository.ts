/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/application/services/prisma.service';
import { ParticipationMechanism } from '../../domain/entities/participation-mechanism.entity';
import { Event } from '../../domain/entities/event.entity';
import { GetEventsDto } from '../../application/dto/get-events.dto';
import { GetEventRegisteredUsersDto } from '../../application/dto/get-event-registered-users.dto';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { PaginationUtil } from 'src/modules/common/infrastructure/utils/pagination.util';
import { EventRegisteredUser } from '../../domain/entities/event-registered-user.entity';

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
      where: { id, status: true },
    });
    if (!event) throw new NotFoundException(`Event not found with id ${id}`);
    return Event.fromPrisma(event);
  }

  async getEventBySimiCode(simiEventCode: string): Promise<Event> {
    const event = await this.prisma.event.findFirst({
      where: { simiEventCode, status: true },
    });
    if (!event) throw new NotFoundException(`Event not found with SIMI code ${simiEventCode}`);
    return Event.fromPrisma(event);
  }

  async getAllEvents(getEventsDto: GetEventsDto): Promise<PaginationType<Event>> {
    const orderBy = getEventsDto.orderBy ?? 'date';
    const orderDirection = getEventsDto.orderDirection ?? 'asc';

    return this.paginationUtil.getPaginatedPrismaData<Event>({
      paginationDto: getEventsDto,
      prismaQuery: () =>
        this.prisma.event
          .findMany({
            where: {
              status: true,
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
            },
            ...this.paginationUtil.getSkipAndTake(getEventsDto),
            orderBy: {
              [orderBy]: orderDirection,
            },
          })
          .then((events) => events.map((event) => Event.fromPrisma(event))),
      countQuery: () =>
        this.prisma.event.count({
          where: {
            status: true,
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
          },
        }),
    });
  }

  async getEventRegisteredUsers(
    eventId: number,
    getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<EventRegisteredUser[]> {
    const event = await this.prisma.event.findFirst({
      where: { id: eventId, status: true },
    });

    if (!event) {
      throw new NotFoundException(`Event not found with id ${eventId}`);
    }

    const participationRegisters = await this.prisma.participationRegister.findMany({
      where: {
        registration: {
          eventId: eventId,
          user: {
            status: true,
          },
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
}
