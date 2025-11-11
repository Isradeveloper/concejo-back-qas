import { Controller, Post, Body, UseGuards, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterService } from '../../application/services/register.service';
import { ParticipationRegister } from '../../domain/entities/participation-register.entity';
import { CreateParticipationRegisterDto } from '../../application/dto/create-participation-register.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateSubscriptionRegisterDto } from '../../application/dto/create-subscription-register.dto';
import { SubscriptionRegister } from '../../domain/entities/subsciption-register.entity';
import { ProposalRegisterDetail } from '../../domain/entities';
import { CreateProposalRegisterDto } from '../../application/dto/create-proposal-register.dto';
import { GetUser } from 'src/modules/common/infrastructure/decorators/get-user.decorator';
import { User } from 'src/modules/users/domain/entities/user.entity';

@ApiTags('registers')
@Controller('registers')
@ApiBearerAuth()
@UseGuards(AuthGuard())
export class RegistersController {
  constructor(private readonly registerService: RegisterService) {}

  @Post('participation')
  @ApiOkResponse({ type: ParticipationRegister })
  create(@Body() createParticipationRegisterDto: CreateParticipationRegisterDto): Promise<ParticipationRegister> {
    return this.registerService.createParticipation(createParticipationRegisterDto);
  }

  @Delete('participation/:id')
  @ApiOkResponse({ description: 'Evento Cancelado Correctamente' })
  async cancelEventRegistration(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    await this.registerService.cancelEventRegistration(id, user.id);
    return { message: 'Evento Cancelado Correctamente' };
  }

  @Post('subscription')
  @ApiOkResponse({ type: SubscriptionRegister })
  createSubscription(
    @Body() createSubscriptionRegisterDto: CreateSubscriptionRegisterDto,
  ): Promise<SubscriptionRegister> {
    return this.registerService.createSubscription(createSubscriptionRegisterDto);
  }

  @Delete('subscription/:id')
  @ApiOkResponse({ description: 'Suscripción eliminada correctamente' })
  async deleteSubscription(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.registerService.deleteSubscription(id);
    return { message: 'Suscripción eliminada correctamente' };
  }

  @Post('proposal')
  @ApiOkResponse({ type: ProposalRegisterDetail })
  createProposal(@Body() createProposalRegisterDto: CreateProposalRegisterDto): Promise<ProposalRegisterDetail> {
    return this.registerService.createProposal(createProposalRegisterDto);
  }
}
