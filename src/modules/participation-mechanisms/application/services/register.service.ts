import { RegisterRepository } from '../../infrastructure/repositories/register.repository';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateParticipationRegisterDto } from '../dto/create-participation-register.dto';
import { ParticipationRegister } from '../../domain/entities/participation-register.entity';
import { UsersService } from 'src/modules/users/application/services/user.service';
import { ParticipationMechanismService } from './participation-mechanism.service';
import { SubscriptionRegister } from '../../domain/entities/subsciption-register.entity';
import { CreateSubscriptionRegisterDto } from '../dto/create-subscription-register.dto';
import { CreateProposalRegisterDto } from '../dto/create-proposal-register.dto';
import { ProposalRegisterDetail } from '../../domain/entities';

@Injectable()
export class RegisterService {
  constructor(
    private readonly participationRegisterRepository: RegisterRepository,
    private readonly usersService: UsersService,
    private readonly participationMechanismService: ParticipationMechanismService,
  ) {}

  async createParticipation(
    createParticipationRegisterDto: CreateParticipationRegisterDto,
  ): Promise<ParticipationRegister> {
    await this.validateUserAndParticipationMechanism(
      createParticipationRegisterDto.userId,
      createParticipationRegisterDto.simiEventCode || '',
    );

    await this.validateParticipationRegisterDuplicates({
      userId: createParticipationRegisterDto.userId,
      simiEventCode: createParticipationRegisterDto.simiEventCode || '',
      ownUser: createParticipationRegisterDto.ownUser,
      organizationEmail: createParticipationRegisterDto.organizationEmail,
    });

    return await this.participationRegisterRepository.createParticipation(createParticipationRegisterDto);
  }

  async createSubscription(
    createSubscriptionRegisterDto: CreateSubscriptionRegisterDto,
  ): Promise<SubscriptionRegister> {
    await this.validateUserAndParticipationMechanism(
      createSubscriptionRegisterDto.userId,
      createSubscriptionRegisterDto.simiEventCode || '',
    );

    await this.validateParticipationRegisterDuplicates({
      userId: createSubscriptionRegisterDto.userId,
      simiEventCode: createSubscriptionRegisterDto.simiEventCode || '',
      ownUser: false,
    });

    return await this.participationRegisterRepository.createSubscription(createSubscriptionRegisterDto);
  }

  async createProposal(createProposalRegisterDto: CreateProposalRegisterDto): Promise<ProposalRegisterDetail> {
    await this.validateUserAndParticipationMechanism(
      createProposalRegisterDto.userId,
      createProposalRegisterDto.simiEventCode || '',
    );

    if (createProposalRegisterDto.cites && createProposalRegisterDto.cites.length > 0) {
      const userIds = createProposalRegisterDto.cites.map((cite) => cite.userId);
      await this.usersService.validateCitedUsersExist(userIds);
    }

    return await this.participationRegisterRepository.createProposal(createProposalRegisterDto);
  }

  private async validateUserAndParticipationMechanism(userId: number, simiEventCode: string): Promise<void> {
    await this.usersService.findOneById(userId);
    await this.participationRegisterRepository.existActiveEvent(simiEventCode);
  }

  private async validateParticipationRegisterDuplicates({
    userId,
    simiEventCode,
    ownUser,
    organizationEmail,
  }: {
    userId: number;
    simiEventCode: string;
    ownUser: boolean;
    organizationEmail?: string;
  }): Promise<void> {
    if (ownUser) {
      const existOwnUserRegistration = await this.participationRegisterRepository.existParticipationRegisterWithOwnUser(
        userId,
        simiEventCode,
      );

      if (existOwnUserRegistration) {
        throw new BadRequestException('El usuario ya tiene un registro como usuario propio para este evento');
      }
    } else {
      if (!organizationEmail) {
        throw new BadRequestException('El email de la organización es requerido cuando ownUser es false');
      }

      const existOrganizationEmailRegistration =
        await this.participationRegisterRepository.existParticipationRegisterWithOrganizationEmail(
          organizationEmail,
          simiEventCode,
        );

      if (existOrganizationEmailRegistration) {
        throw new BadRequestException('Ya existe un registro con este email de organización para este evento');
      }
    }
  }
}
