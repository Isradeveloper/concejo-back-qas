import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RegisterService } from '../../application/services/register.service';
import { ParticipationRegister } from '../../domain/entities/participation-register.entity';
import { CreateParticipationRegisterDto } from '../../application/dto/create-participation-register.dto';
import { AuthGuard } from '@nestjs/passport';
import { CreateSubscriptionRegisterDto } from '../../application/dto/create-subscription-register.dto';
import { SubscriptionRegister } from '../../domain/entities/subsciption-register.entity';
import { ProposalRegisterDetail } from '../../domain/entities';
import { CreateProposalRegisterDto } from '../../application/dto/create-proposal-register.dto';

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

  @Post('subscription')
  @ApiOkResponse({ type: SubscriptionRegister })
  createSubscription(
    @Body() createSubscriptionRegisterDto: CreateSubscriptionRegisterDto,
  ): Promise<SubscriptionRegister> {
    return this.registerService.createSubscription(createSubscriptionRegisterDto);
  }

  @Post('proposal')
  @ApiOkResponse({ type: ProposalRegisterDetail })
  createProposal(@Body() createProposalRegisterDto: CreateProposalRegisterDto): Promise<ProposalRegisterDetail> {
    return this.registerService.createProposal(createProposalRegisterDto);
  }
}
