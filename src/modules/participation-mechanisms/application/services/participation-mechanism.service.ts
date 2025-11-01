import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ParticipationMechanismRepository } from '../../infrastructure/repositories/participation-mechanism.repository';
import { envVars } from 'src/config/envs';
import { HttpService } from '@nestjs/axios';
import { getDataForTwoWeeks } from '../../infrastructure/utils/get-data-for-two-weeks.util';
import { getCurrentDate } from 'src/modules/common/infrastructure/utils/dates.util';
import {
  ParticipationMechanismEvent,
  ParticipationMechanismEventResponse,
  Event,
  AccidentalCommissionDetail,
  AccidentalCommissionDetailResponse,
  ParticipationDetail,
  ParticipationDetailResponse,
  ParticipationMechanism,
  AllEventsRegisteredUser,
} from '../../domain/entities';
import { EventRegisteredUser } from '../../domain/entities/event-registered-user.entity';
import { ProposalRegister } from '../../domain/entities/proposal-register.entity';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { GetEventsDto } from '../dto/get-events.dto';
import { GetEventRegisteredUsersDto } from '../dto/get-event-registered-users.dto';
import { GetProposalsDto } from '../dto/get-proposals.dto';
import { GetProposalsByCitationsDto } from '../dto/get-proposals-by-citations.dto';
import { DeactivateEventDto } from '../dto/deactivate-event.dto';
import { ReactivateEventDto } from '../dto/reactivate-event.dto';
import { exportToExcelWithJson } from 'src/modules/common/infrastructure/utils/export-to-excel.utils';

@Injectable()
export class ParticipationMechanismService {
  constructor(
    private readonly participationMechanismRepository: ParticipationMechanismRepository,
    private readonly httpService: HttpService,
  ) {}

  async findOneById(id: number): Promise<ParticipationMechanism> {
    return await this.participationMechanismRepository.findOneById(id);
  }

  async findOneByType(type: string): Promise<ParticipationMechanism> {
    return await this.participationMechanismRepository.findOneByType(type);
  }

  async getAll(): Promise<ParticipationMechanism[]> {
    return await this.participationMechanismRepository.getAll();
  }

  async getPlenarySessions(): Promise<ParticipationMechanismEvent[]> {
    const { year, month, day } = getCurrentDate();

    const response = await this.httpService.axiosRef.get<ParticipationMechanismEventResponse[]>(
      `${envVars.API_SIMI_URL}/dtsesiones?year=${year}&month=${month}&day=${day}`,
    );

    const inactiveSimiCodes = await this.participationMechanismRepository.getInactiveSimiCodes();

    return getDataForTwoWeeks(
      response.data.map((plenarySession) => ParticipationMechanismEvent.fromResponse(plenarySession)),
    ).filter(
      (plenarySession) =>
        plenarySession.exhaustedAgenda !== 'si' &&
        !this.isEventInactive(plenarySession.consecutivePlenary, inactiveSimiCodes),
    );
  }

  async getAccidentalCommissions(): Promise<ParticipationMechanismEvent[]> {
    const { year, month, day } = getCurrentDate();

    const response = await this.httpService.axiosRef.get<ParticipationMechanismEventResponse[]>(
      `${envVars.API_SIMI_URL}/ppreuniones?year=${year}&month=${month}&day=${day}`,
    );

    const inactiveSimiCodes = await this.participationMechanismRepository.getInactiveSimiCodes();

    return getDataForTwoWeeks(
      response.data
        .map((accidentalCommission) => ParticipationMechanismEvent.fromResponse(accidentalCommission))
        .filter(
          (accidentalCommission) =>
            accidentalCommission.status !== 'cancelada' &&
            !this.isEventInactive(accidentalCommission.consecutive, inactiveSimiCodes),
        ),
    );
  }

  async getParticipations(type: 'all' | 'primer debate' | 'estudio' = 'all'): Promise<ParticipationMechanismEvent[]> {
    const { year, month, day } = getCurrentDate();

    const response = await this.httpService.axiosRef.get<ParticipationMechanismEventResponse[]>(
      `${envVars.API_SIMI_URL}/pareuniones?year=${year}&month=${month}&day=${day}`,
    );

    const inactiveSimiCodes = await this.participationMechanismRepository.getInactiveSimiCodes();

    console.log(JSON.stringify(response.data, null, 2));

    return getDataForTwoWeeks(
      response.data
        .map((participation) => ParticipationMechanismEvent.fromResponse(participation))
        .filter(
          (participation) =>
            participation.status !== 'cancelada' &&
            (type === 'all' || participation.debate === type) &&
            !this.isEventInactive(participation.consecutive, inactiveSimiCodes),
        ),
    );
  }

  async getParticipationDetail(id: string): Promise<ParticipationDetail> {
    try {
      const response = await this.httpService.axiosRef.get<ParticipationDetailResponse>(
        `${envVars.API_SIMI_URL}/padetalle?id=${id}`,
      );

      return ParticipationDetail.fromResponse(response.data);
    } catch (error) {
      Logger.error('Error al obtener el detalle de la participación', error);
      throw new BadRequestException('Error al obtener el detalle de la participación', error as Error);
    }
  }

  async getAccidentalCommissionDetail(id: string): Promise<AccidentalCommissionDetail> {
    try {
      const response = await this.httpService.axiosRef.get<AccidentalCommissionDetailResponse>(
        `${envVars.API_SIMI_URL}/comisiondetalle?id=${id}`,
      );

      return AccidentalCommissionDetail.fromResponse(response.data);
    } catch (error) {
      Logger.error('Error al obtener el detalle de la comisión accidental', error);
      throw new BadRequestException('Error al obtener el detalle de la comisión accidental');
    }
  }

  async getAllEvents(getEventsDto: GetEventsDto): Promise<PaginationType<Event>> {
    return await this.participationMechanismRepository.getAllEvents(getEventsDto);
  }

  async getEventRegisteredUsers(
    eventId: number,
    getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<EventRegisteredUser[]> {
    return await this.participationMechanismRepository.getEventRegisteredUsers(eventId, getEventRegisteredUsersDto);
  }

  async getEventRegisteredUsersExcel(
    eventId: number,
    getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<string> {
    const eventRegisteredUsers = await this.getEventRegisteredUsers(eventId, getEventRegisteredUsersDto);

    const plainData: Record<string, unknown>[] = eventRegisteredUsers.map((user) => ({
      id: user.id,
      nombre: user.firstName,
      apellido: user.lastName,
      email: user.email,
      documento: user.documentNumber,
      telefono: user.phoneNumber,
      tipoUsuario: user.userType.name,
      tipoDocumento: user.documentType.name,
      dependency: user.dependency?.name || '',
      registroPropio: user.ownUser ? 'Si' : 'No',
      nombreOrganizacion: user.organizationName || '',
      nitOrganizacion: user.organizationNit || '',
      emailOrganizacion: user.organizationEmail || '',
      rolOrganizacion: user.organizationRole || '',
    }));

    return await exportToExcelWithJson(plainData, 'America/Bogota', 'DD/MM/YYYY', {
      worksheetName: 'Usuario registrados',
    });
  }

  async getAllEventsRegisteredUsers(
    getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<PaginationType<AllEventsRegisteredUser>> {
    return await this.participationMechanismRepository.getAllEventsRegisteredUsers(getEventRegisteredUsersDto);
  }

  async getAllEventsRegisteredUsersExcel(getEventRegisteredUsersDto: GetEventRegisteredUsersDto): Promise<string> {
    const allEventsRegisteredUsers =
      await this.participationMechanismRepository.getAllEventsRegisteredUsersNoPagination(getEventRegisteredUsersDto);

    const plainData: Record<string, unknown>[] = allEventsRegisteredUsers.map((user) => ({
      codigoEvento: user.eventSimiEventCode,
      descripcionEvento: user.eventDescription,
      tipoParticipacion: user.participationName,
      nombre: user.firstName,
      apellido: user.lastName,
      email: user.email,
      documento: user.documentNumber,
      telefono: user.phoneNumber,
      tipoUsuario: user.userType.name,
      tipoDocumento: user.documentType.name,
      dependency: user.dependency?.name || '',
      registroPropio: user.ownUser ? 'Si' : 'No',
      nombreOrganizacion: user.organizationName || '',
      nitOrganizacion: user.organizationNit || '',
      emailOrganizacion: user.organizationEmail || '',
      rolOrganizacion: user.organizationRole || '',
    }));

    return await exportToExcelWithJson(plainData, 'America/Bogota', 'DD/MM/YYYY', {
      worksheetName: 'Usuarios registrados',
    });
  }

  async getEventById(id: number): Promise<Event> {
    return await this.participationMechanismRepository.getEventById(id);
  }

  async getAllProposals(getProposalsDto: GetProposalsDto): Promise<PaginationType<ProposalRegister>> {
    return await this.participationMechanismRepository.getAllProposals(getProposalsDto);
  }

  async getProposalsByUserCitations(
    userId: number,
    getProposalsByCitationsDto: GetProposalsByCitationsDto,
  ): Promise<PaginationType<ProposalRegister>> {
    return await this.participationMechanismRepository.getProposalsByUserCitations(userId, getProposalsByCitationsDto);
  }

  async getProposalById(id: number): Promise<ProposalRegister> {
    return await this.participationMechanismRepository.getProposalById(id);
  }

  async deactivateEvent(deactivateEventDto: DeactivateEventDto, userId: number): Promise<void> {
    return await this.participationMechanismRepository.deactivateEvent(deactivateEventDto.simiEventCode, userId);
  }

  async reactivateEvent(reactivateEventDto: ReactivateEventDto): Promise<void> {
    return await this.participationMechanismRepository.reactivateEvent(reactivateEventDto.simiEventCode);
  }

  private isEventInactive(eventId: string | null | undefined, inactiveSimiCodes: string[]): boolean {
    if (!eventId) return false;

    return inactiveSimiCodes.some((code) => code.includes(eventId));
  }
}
