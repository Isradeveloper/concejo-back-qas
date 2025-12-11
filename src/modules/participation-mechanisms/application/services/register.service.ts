import { RegisterRepository } from '../../infrastructure/repositories/register.repository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateParticipationRegisterDto } from '../dto/create-participation-register.dto';
import { ParticipationRegister } from '../../domain/entities/participation-register.entity';
import { UsersService } from 'src/modules/users/application/services/user.service';
import { ParticipationMechanismService } from './participation-mechanism.service';
import { SubscriptionRegister } from '../../domain/entities/subsciption-register.entity';
import { CreateSubscriptionRegisterDto } from '../dto/create-subscription-register.dto';
import { CreateProposalRegisterDto } from '../dto/create-proposal-register.dto';
import { CreateCiteDto } from '../dto/create-cite.dto';
import { AnswerCiteQuestionDto } from '../dto/answer-cite-question.dto';
import { ChangeProposalStatusDto } from '../dto/change-proposal-status.dto';
import { InterestTopic, ProposalRegisterDetail } from '../../domain/entities';
import { MailerService } from 'src/modules/common/application/services/mailer.service';
import { ParticipationMailUtil } from '../../infrastructure/utils/participation-mail.util';
import {
  ProposalMailUtil,
  ProposalCiteMailUtil,
  ProposalAnswerMailUtil,
} from '../../infrastructure/utils/proposal-mail.util';
import { EventCancellationMailUtil } from '../../infrastructure/utils/event-cancellation-mail.util';
import {
  SubscriptionMailUtil,
  SubscriptionCancellationMailUtil,
} from '../../infrastructure/utils/subscription-mail.util';
import { typesInSpanish } from '../../domain/constants/register-types.constants';
import { HttpService } from '@nestjs/axios';
import { envVars } from 'src/config/envs';

@Injectable()
export class RegisterService {
  constructor(
    private readonly participationRegisterRepository: RegisterRepository,
    private readonly usersService: UsersService,
    private readonly participationMechanismService: ParticipationMechanismService,
    private readonly mailerService: MailerService,
    private readonly httpService: HttpService,
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

    const participationRegister =
      await this.participationRegisterRepository.createParticipation(createParticipationRegisterDto);

    await this.mailerService.sendEmail({
      to: participationRegister.registration.user.email,
      subject: `Registro de participación exitoso ${typesInSpanish[participationRegister.registration.event?.type as keyof typeof typesInSpanish]}  ${participationRegister.registration.event?.simiEventCode}`,
      htmlBody: new ParticipationMailUtil(participationRegister).render(),
    });

    return participationRegister;
  }

  async createSubscription(
    createSubscriptionRegisterDto: CreateSubscriptionRegisterDto,
  ): Promise<SubscriptionRegister> {
    const user = await this.usersService.findOneById(createSubscriptionRegisterDto.userId);

    const interestTopic = await this.validateInterestTopic(createSubscriptionRegisterDto.simiTopicId);

    await this.validateSubscriptionDuplicates(
      createSubscriptionRegisterDto.userId,
      createSubscriptionRegisterDto.simiTopicId,
    );

    const subscriptionDtoWithTopic = {
      ...createSubscriptionRegisterDto,
      topic: interestTopic.topic || '',
    };

    const { data } = await this.httpService.axiosRef.get(
      `${envVars.API_SIMI_URL}/participacion?correo=${user!.email}&tema=${interestTopic.topic}&subscribe=1`,
    );

    if (data['error'] || data['success'] !== '200') {
      throw new BadRequestException('No fue posible crear la suscripción en SIMI');
    }

    const subscriptionRegister =
      await this.participationRegisterRepository.createSubscription(subscriptionDtoWithTopic);

    if (
      subscriptionRegister.registration &&
      subscriptionRegister.registration.user &&
      subscriptionRegister.registration.user.email
    ) {
      await this.mailerService.sendEmail({
        to: subscriptionRegister.registration.user.email,
        subject: `Suscripción exitosa al tema de interés: ${subscriptionRegister.topic}`,
        htmlBody: new SubscriptionMailUtil(subscriptionRegister).render(),
      });
    }

    return subscriptionRegister;
  }

  async deleteSubscription(subscriptionId: number): Promise<void> {
    const subscription = await this.participationRegisterRepository.findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new NotFoundException('Suscripción no encontrada');
    }

    const { data } = await this.httpService.axiosRef.get(
      `${envVars.API_SIMI_URL}/participacion?correo=${subscription.registration.user.email}&tema=${subscription.topic}&subscribe=0`,
    );
    if (data['error'] || data['success'] !== '200') {
      throw new BadRequestException('No fue posible eliminar la suscripción en SIMI');
    }

    await this.participationRegisterRepository.deleteSubscription(subscriptionId);

    if (subscription.registration && subscription.registration.user && subscription.registration.user.email) {
      await this.mailerService.sendEmail({
        to: subscription.registration.user.email,
        subject: `Cancelación de suscripción al tema de interés: ${subscription.topic}`,
        htmlBody: new SubscriptionCancellationMailUtil(subscription).render(),
      });
    }
  }

  async cancelEventRegistration(participationRegisterId: number, userId: number): Promise<void> {
    const participationRegister =
      await this.participationRegisterRepository.findParticipationRegisterById(participationRegisterId);

    if (!participationRegister) {
      throw new NotFoundException('Registro de participación no encontrado');
    }

    if (participationRegister.registration.user.id !== userId) {
      throw new BadRequestException('No tienes permisos para cancelar este registro');
    }

    if (!participationRegister.registration.event) {
      throw new BadRequestException('El registro no está asociado a un evento');
    }

    const cancelledParticipationRegister =
      await this.participationRegisterRepository.deleteParticipation(participationRegisterId);

    const eventType = cancelledParticipationRegister.registration.event?.type
      ? typesInSpanish[cancelledParticipationRegister.registration.event.type as keyof typeof typesInSpanish]
      : '';
    const eventCode = cancelledParticipationRegister.registration.event?.simiEventCode || '';

    await this.mailerService.sendEmail({
      to: cancelledParticipationRegister.registration.user.email,
      subject: `Cancelación de registro ${eventType} ${eventCode}`.trim(),
      htmlBody: new EventCancellationMailUtil(cancelledParticipationRegister).render(),
    });
  }

  async createProposal(createProposalRegisterDto: CreateProposalRegisterDto): Promise<ProposalRegisterDetail> {
    await this.usersService.findOneById(createProposalRegisterDto.userId);

    if (createProposalRegisterDto.cites && createProposalRegisterDto.cites.length > 0) {
      const userIds = createProposalRegisterDto.cites.map((cite) => cite.userId);
      await this.usersService.validateCitedUsersExist(userIds);
      await this.validateUniqueCites(createProposalRegisterDto.cites);
    }

    const proposalRegister = await this.participationRegisterRepository.createProposal(createProposalRegisterDto);

    if (proposalRegister.registration && proposalRegister.registration.user) {
      const creatorUser = proposalRegister.registration.user;
      if (creatorUser.email) {
        await this.mailerService.sendEmail({
          to: creatorUser.email,
          subject: `Propuesta ciudadana Nº ${proposalRegister.id} creada exitosamente`,
          htmlBody: new ProposalMailUtil(proposalRegister).render(),
        });
      }
    }

    if (proposalRegister.registrationCites && proposalRegister.registrationCites.length > 0) {
      for (const registrationCite of proposalRegister.registrationCites) {
        if (registrationCite.user && registrationCite.user.email) {
          await this.mailerService.sendEmail({
            // to: registrationCite.user.email,
            to: envVars.MANAGER_EMAIL,
            subject: `${registrationCite.user.firstName} ${registrationCite.user.lastName || ''} - Has recibido una propuesta para el control político Nº ${proposalRegister.id}`,
            htmlBody: new ProposalCiteMailUtil(proposalRegister, registrationCite).render(),
          });
        }
      }
    }

    return proposalRegister;
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

  private async validateUniqueCites(cites: CreateCiteDto[]): Promise<void> {
    const userIds = cites.map((cite) => cite.userId);
    const uniqueUserIds = new Set(userIds);

    if (userIds.length !== uniqueUserIds.size) {
      const duplicateUserId = userIds.find((id, index) => userIds.indexOf(id) !== index);

      if (duplicateUserId !== undefined) {
        const user = await this.usersService.findOneById(duplicateUserId);
        if (user) {
          const userName = `${user.firstName} ${user.lastName || ''}`.trim();
          throw new BadRequestException(
            `No se puede repetir un usuario en las citaciones. El usuario ${userName} - ${user.dependency?.name}) está duplicado`,
          );
        }
      }

      throw new BadRequestException('No se puede repetir un usuario en las citaciones');
    }
  }

  async answerCiteQuestion(citeQuestionId: number, answerDto: AnswerCiteQuestionDto, userId: number): Promise<void> {
    const result = await this.participationRegisterRepository.answerCiteQuestion(
      citeQuestionId,
      answerDto.answer,
      userId,
    );

    const creatorUser = result.citeQuestion.registrationCite.proposalRegister.registration.user;
    const citedUser = result.citeQuestion.registrationCite.user;
    const proposalRegister = result.citeQuestion.registrationCite.proposalRegister;

    if (creatorUser && creatorUser.email) {
      await this.mailerService.sendEmail({
        to: creatorUser.email,
        subject: `Respuesta recibida en la propuesta ciudadana Nº ${proposalRegister.id}`,
        htmlBody: new ProposalAnswerMailUtil({
          proposalId: proposalRegister.id,
          simiEventCode: proposalRegister.simiEventCode,
          politicalTopic: proposalRegister.politicalTopic,
          creatorFirstName: creatorUser.firstName,
          creatorLastName: creatorUser.lastName || null,
          citedUserFirstName: citedUser.firstName,
          citedUserLastName: citedUser.lastName || null,
          citedUserDependency: citedUser.dependency?.name || null,
          question: result.citeQuestion.question,
          answer: result.citeQuestion.answer,
        }).render(),
      });
    }
  }

  async changeProposalStatus(
    proposalRegisterId: number,
    changeProposalStatusDto: ChangeProposalStatusDto,
  ): Promise<void> {
    await this.participationRegisterRepository.changeProposalStatus(
      proposalRegisterId,
      changeProposalStatusDto.proposalStatusId,
    );
  }

  private async validateInterestTopic(simiTopicId: string): Promise<InterestTopic> {
    const interestTopics = await this.participationMechanismService.getInterestTopics();
    const topic = interestTopics.find((topic) => topic.id?.toString() === simiTopicId);

    if (!topic) {
      throw new BadRequestException(`El tema de interés con ID ${simiTopicId} no existe`);
    }

    return topic;
  }

  private async validateSubscriptionDuplicates(userId: number, simiTopicId: string): Promise<void> {
    const exists = await this.participationRegisterRepository.existSubscriptionRegister(userId, simiTopicId);

    if (exists) {
      throw new BadRequestException('El usuario ya está suscrito a este tema de interés');
    }
  }
}
