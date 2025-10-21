import { Controller, Get, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParticipationMechanismService } from '../../application/services/participation-mechanism.service';
import {
  ParticipationMechanismEvent,
  ParticipationDetail,
  ParticipationMechanism,
  AccidentalCommissionDetail,
  Event,
} from '../../domain/entities';
import { EventRegisteredUser } from '../../domain/entities/event-registered-user.entity';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { GetEventsDto } from '../../application/dto/get-events.dto';
import { GetEventRegisteredUsersDto } from '../../application/dto/get-event-registered-users.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('participation-mechanisms')
@Controller('participation-mechanisms')
export class ParticipationMechanismsController {
  constructor(private readonly participationMechanismService: ParticipationMechanismService) {}

  @Get()
  @ApiOkResponse({ type: ParticipationMechanism, isArray: true })
  findAll(): Promise<ParticipationMechanism[]> {
    return this.participationMechanismService.getAll();
  }

  @Get('list/:type')
  @ApiOkResponse({ type: ParticipationMechanism })
  findOne(@Param('type') type: string): Promise<ParticipationMechanism> {
    return this.participationMechanismService.findOneByType(type);
  }

  @Get('plenary-sessions')
  @ApiOkResponse({ type: ParticipationMechanismEvent, isArray: true })
  getPlenarySessions(): Promise<ParticipationMechanismEvent[]> {
    return this.participationMechanismService.getPlenarySessions();
  }

  @Get('accidental-commissions')
  @ApiOkResponse({ type: ParticipationMechanismEvent, isArray: true })
  getAccidentalCommissions(): Promise<ParticipationMechanismEvent[]> {
    return this.participationMechanismService.getAccidentalCommissions();
  }

  @Get('participations')
  @ApiOkResponse({ type: ParticipationMechanismEvent, isArray: true })
  getParticipations(
    @Query('type') type: 'all' | 'primer debate' | 'estudio' = 'all',
  ): Promise<ParticipationMechanismEvent[]> {
    return this.participationMechanismService.getParticipations(type);
  }

  @Get('participation-detail/:id')
  @ApiOkResponse({ type: ParticipationDetail })
  getParticipationDetail(@Param('id') id: string): Promise<ParticipationDetail> {
    return this.participationMechanismService.getParticipationDetail(id);
  }

  @Get('accidental-commission-detail/:id')
  @ApiOkResponse({ type: AccidentalCommissionDetail })
  getAccidentalCommissionDetail(@Param('id') id: string): Promise<AccidentalCommissionDetail> {
    return this.participationMechanismService.getAccidentalCommissionDetail(id);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('events')
  @ApiOkResponse({ type: Event, isArray: true })
  getAllEvents(@Query() getEventsDto: GetEventsDto): Promise<PaginationType<Event>> {
    return this.participationMechanismService.getAllEvents(getEventsDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('events/:id')
  @ApiOkResponse({ type: Event })
  getEventById(@Param('id') id: string): Promise<Event> {
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      throw new BadRequestException('Invalid event ID');
    }
    return this.participationMechanismService.getEventById(eventId);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('events/:eventId/registered-users')
  @ApiOkResponse({ type: EventRegisteredUser, isArray: true })
  async getEventRegisteredUsers(
    @Param('eventId') eventId: string,
    @Query() getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<EventRegisteredUser[]> {
    const eventIdNumber = parseInt(eventId);
    if (isNaN(eventIdNumber)) {
      throw new BadRequestException('Invalid event ID');
    }
    return await this.participationMechanismService.getEventRegisteredUsers(eventIdNumber, getEventRegisteredUsersDto);
  }
}
