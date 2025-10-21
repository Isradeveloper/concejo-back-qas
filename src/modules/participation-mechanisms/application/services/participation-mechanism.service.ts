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
} from '../../domain/entities';
import { EventRegisteredUser } from '../../domain/entities/event-registered-user.entity';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { GetEventsDto } from '../dto/get-events.dto';
import { GetEventRegisteredUsersDto } from '../dto/get-event-registered-users.dto';

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

    return getDataForTwoWeeks(
      response.data.map((plenarySession) => ParticipationMechanismEvent.fromResponse(plenarySession)),
    ).filter((plenarySession) => plenarySession.exhaustedAgenda !== 'si');
  }

  async getAccidentalCommissions(): Promise<ParticipationMechanismEvent[]> {
    const { year, month, day } = getCurrentDate();

    const response = await this.httpService.axiosRef.get<ParticipationMechanismEventResponse[]>(
      `${envVars.API_SIMI_URL}/ppreuniones?year=${year}&month=${month}&day=${day}`,
    );

    return getDataForTwoWeeks(
      response.data
        .map((accidentalCommission) => ParticipationMechanismEvent.fromResponse(accidentalCommission))
        .filter((accidentalCommission) => accidentalCommission.status !== 'cancelada'),
    );
  }

  async getParticipations(type: 'all' | 'primer debate' | 'estudio' = 'all'): Promise<ParticipationMechanismEvent[]> {
    const { year, month, day } = getCurrentDate();

    const response = await this.httpService.axiosRef.get<ParticipationMechanismEventResponse[]>(
      `${envVars.API_SIMI_URL}/pareuniones?year=${year}&month=${month}&day=${day}`,
    );

    return getDataForTwoWeeks(
      response.data
        .map((participation) => ParticipationMechanismEvent.fromResponse(participation))
        .filter(
          (participation) => participation.status !== 'cancelada' && (type === 'all' || participation.debate === type),
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

  async getEventById(id: number): Promise<Event> {
    return await this.participationMechanismRepository.getEventById(id);
  }
}
