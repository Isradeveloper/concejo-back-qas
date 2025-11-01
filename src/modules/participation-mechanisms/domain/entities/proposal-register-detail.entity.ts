import { ApiProperty } from '@nestjs/swagger';
import { ProposalRegister } from './proposal-register.entity';
import { RegistrationCite } from './registration-cite.entity';
import {
  ProposalRegister as PrismaProposalRegister,
  ProposalStatus as PrismaProposalStatus,
  Registration as PrismaRegistration,
  User as PrismaUser,
  UserType as PrismaUserType,
  DocumentType as PrismaDocumentType,
  ParticipationMechanism as PrismaParticipationMechanism,
  RegistrationCite as PrismaRegistrationCite,
  CiteQuestion as PrismaCiteQuestion,
  Dependency as PrismaDependency,
} from '@prisma/client';

export class ProposalRegisterDetail extends ProposalRegister {
  static fromPrisma(
    proposalRegister: PrismaProposalRegister & {
      proposalStatus: PrismaProposalStatus;
      registration: PrismaRegistration & {
        user: PrismaUser & { userType: PrismaUserType; documentType: PrismaDocumentType };
        participationMechanism: PrismaParticipationMechanism;
      };
      RegistrationCite?: (PrismaRegistrationCite & {
        user?: PrismaUser & {
          userType: PrismaUserType;
          documentType: PrismaDocumentType;
          dependency: PrismaDependency;
        };
        CiteQuestion?: PrismaCiteQuestion[];
      })[];
    },
  ): ProposalRegisterDetail {
    const baseRegister = ProposalRegister.fromPrisma(proposalRegister);

    return {
      ...baseRegister,
      simiEventCode: proposalRegister.simiEventCode,
      politicalTopic: proposalRegister.politicalTopic,
      politicalTopicJustification: proposalRegister.politicalTopicJustification,
      registration: proposalRegister.registration as PrismaRegistration & {
        user?: Partial<PrismaUser>;
      },
      registrationCites: proposalRegister.RegistrationCite
        ? proposalRegister.RegistrationCite.map((rc) => RegistrationCite.fromPrisma(rc))
        : [],
    };
  }

  @ApiProperty({
    description: 'The registration cites associated with this proposal register',
    type: [RegistrationCite],
    isArray: true,
  })
  registrationCites: RegistrationCite[];
}
