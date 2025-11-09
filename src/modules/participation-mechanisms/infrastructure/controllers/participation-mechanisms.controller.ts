import { Controller, Get, Param, Query, UseGuards, BadRequestException, Put, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParticipationMechanismService } from '../../application/services/participation-mechanism.service';
import {
  ParticipationMechanismEvent,
  ParticipationDetail,
  ParticipationMechanism,
  AccidentalCommissionDetail,
  Event,
  AllEventsRegisteredUser,
  InterestTopic,
  SubscriptionRegister,
} from '../../domain/entities';
import { EventRegisteredUser } from '../../domain/entities/event-registered-user.entity';
import { SubscriptionRegisteredUser } from '../../domain/entities/subscription-registered-user.entity';
import { ProposalRegister } from '../../domain/entities/proposal-register.entity';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { GetEventsDto } from '../../application/dto/get-events.dto';
import { GetEventRegisteredUsersDto } from '../../application/dto/get-event-registered-users.dto';
import { GetSubscriptionsDto } from '../../application/dto/get-subscriptions.dto';
import { GetSubscriptionRegisteredUsersDto } from '../../application/dto/get-subscription-registered-users.dto';
import { GetProposalsDto } from '../../application/dto/get-proposals.dto';
import { GetProposalsByCitationsDto } from '../../application/dto/get-proposals-by-citations.dto';
import { AnswerCiteQuestionDto } from '../../application/dto/answer-cite-question.dto';
import { ChangeProposalStatusDto } from '../../application/dto/change-proposal-status.dto';
import { DeactivateEventDto } from '../../application/dto/deactivate-event.dto';
import { ReactivateEventDto } from '../../application/dto/reactivate-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { RegisterService } from '../../application/services/register.service';
import { GetUser } from 'src/modules/common/infrastructure/decorators/get-user.decorator';
import { User } from 'src/modules/users/domain/entities/user.entity';

@ApiTags('participation-mechanisms')
@Controller('participation-mechanisms')
export class ParticipationMechanismsController {
  constructor(
    private readonly participationMechanismService: ParticipationMechanismService,
    private readonly registerService: RegisterService,
  ) {}

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

  @Get('interest-topics')
  @ApiOkResponse({ type: InterestTopic, isArray: true })
  getInterestTopics(): Promise<InterestTopic[]> {
    return this.participationMechanismService.getInterestTopics();
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
      throw new BadRequestException('ID de evento inválido');
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
      throw new BadRequestException('ID de evento inválido');
    }
    return await this.participationMechanismService.getEventRegisteredUsers(eventIdNumber, getEventRegisteredUsersDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('events/:eventId/registered-users/excel')
  @ApiOkResponse({ type: String })
  async getEventRegisteredUsersExcel(
    @Param('eventId') eventId: string,
    @Query() getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<string> {
    const eventIdNumber = parseInt(eventId);
    if (isNaN(eventIdNumber)) {
      throw new BadRequestException('ID de evento inválido');
    }
    return await this.participationMechanismService.getEventRegisteredUsersExcel(
      eventIdNumber,
      getEventRegisteredUsersDto,
    );
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('all-events-registered-users')
  @ApiOkResponse({ type: AllEventsRegisteredUser, isArray: true })
  async getAllEventsRegisteredUsers(
    @Query() getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<PaginationType<AllEventsRegisteredUser>> {
    return await this.participationMechanismService.getAllEventsRegisteredUsers(getEventRegisteredUsersDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('all-events-registered-users/excel')
  @ApiOkResponse({ type: String })
  async getAllEventsRegisteredUsersExcel(
    @Query() getEventRegisteredUsersDto: GetEventRegisteredUsersDto,
  ): Promise<string> {
    return await this.participationMechanismService.getAllEventsRegisteredUsersExcel(getEventRegisteredUsersDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('proposals')
  @ApiOkResponse({ type: ProposalRegister, isArray: true })
  getAllProposals(@Query() getProposalsDto: GetProposalsDto): Promise<PaginationType<ProposalRegister>> {
    return this.participationMechanismService.getAllProposals(getProposalsDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('proposals/by-citations')
  @ApiOkResponse({ type: ProposalRegister, isArray: true })
  getProposalsByCitations(
    @Query() getProposalsByCitationsDto: GetProposalsByCitationsDto,
    @GetUser() user: User,
  ): Promise<PaginationType<ProposalRegister>> {
    return this.participationMechanismService.getProposalsByUserCitations(user.id, getProposalsByCitationsDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('proposals/:id')
  @ApiOkResponse({ type: ProposalRegister })
  getProposalById(@Param('id') id: string): Promise<ProposalRegister> {
    const proposalId = parseInt(id);
    if (isNaN(proposalId)) {
      throw new BadRequestException('ID de propuesta inválido');
    }
    return this.participationMechanismService.getProposalById(proposalId);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Put('cite-questions/:id/answer')
  @ApiOkResponse({ description: 'Pregunta de cita respondida correctamente' })
  async answerCiteQuestion(
    @Param('id') id: string,
    @Body() answerDto: AnswerCiteQuestionDto,
    @Request() req: { user: { id: number } },
  ): Promise<{ message: string }> {
    const citeQuestionId = parseInt(id);
    if (isNaN(citeQuestionId)) {
      throw new BadRequestException('ID de pregunta de cita inválido');
    }

    const userId = req.user.id;
    await this.registerService.answerCiteQuestion(citeQuestionId, answerDto, userId);

    return { message: 'Pregunta de cita respondida correctamente' };
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Put('proposals/:id/status')
  @ApiOkResponse({ description: 'Estado de propuesta actualizado correctamente' })
  async changeProposalStatus(
    @Param('id') id: string,
    @Body() changeProposalStatusDto: ChangeProposalStatusDto,
  ): Promise<{ message: string }> {
    const proposalId = parseInt(id);
    if (isNaN(proposalId)) {
      throw new BadRequestException('ID de propuesta inválido');
    }

    await this.registerService.changeProposalStatus(proposalId, changeProposalStatusDto);

    return { message: 'Estado de propuesta actualizado correctamente' };
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Put('events/deactivate')
  @ApiOkResponse({ description: 'Evento desactivado correctamente' })
  async deactivateEvent(
    @Body() deactivateEventDto: DeactivateEventDto,
    @Request() req: { user: { id: number } },
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.participationMechanismService.deactivateEvent(deactivateEventDto, userId);

    return { message: 'Evento desactivado correctamente' };
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Put('events/reactivate')
  @ApiOkResponse({ description: 'Evento reactivado correctamente' })
  async reactivateEvent(@Body() reactivateEventDto: ReactivateEventDto): Promise<{ message: string }> {
    await this.participationMechanismService.reactivateEvent(reactivateEventDto);

    return { message: 'Evento reactivado correctamente' };
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('subscriptions')
  @ApiOkResponse({ type: SubscriptionRegister, isArray: true })
  getAllSubscriptions(@Query() getSubscriptionsDto: GetSubscriptionsDto): Promise<PaginationType<SubscriptionRegister>> {
    return this.participationMechanismService.getAllSubscriptions(getSubscriptionsDto);
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('subscriptions/:simiTopicId/registered-users')
  @ApiOkResponse({ type: SubscriptionRegisteredUser, isArray: true })
  async getSubscriptionRegisteredUsers(
    @Param('simiTopicId') simiTopicId: string,
    @Query() getSubscriptionRegisteredUsersDto: GetSubscriptionRegisteredUsersDto,
  ): Promise<SubscriptionRegisteredUser[]> {
    return await this.participationMechanismService.getSubscriptionRegisteredUsers(
      simiTopicId,
      getSubscriptionRegisteredUsersDto,
    );
  }

  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Get('subscriptions/excel')
  @ApiOkResponse({ type: String })
  async getAllSubscriptionsExcel(@Query() getSubscriptionsDto: GetSubscriptionsDto): Promise<string> {
    return await this.participationMechanismService.getAllSubscriptionsExcel(getSubscriptionsDto);
  }
}
