import { ApiProperty } from '@nestjs/swagger';
import {
  ProposalRegister as PrismaProposalRegister,
  type ProposalStatus as PrismaProposalStatus,
} from '@prisma/client';

export class ProposalRegister {
  static fromPrisma(
    proposalRegister: PrismaProposalRegister & {
      proposalStatus: PrismaProposalStatus;
    },
  ): ProposalRegister {
    return {
      id: proposalRegister.id,
      proposalStatus: proposalRegister.proposalStatus,
      createdAt: proposalRegister.createdAt,
      updatedAt: proposalRegister.updatedAt || null,
    };
  }

  @ApiProperty({
    description: 'The id of the proposal register',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The proposal status of the proposal register',
    example: {
      id: 1,
      name: 'Pending',
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  proposalStatus: PrismaProposalStatus;

  @ApiProperty({
    description: 'The created at of the proposal register',
    example: new Date(),
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The updated at of the proposal register',
    example: new Date(),
  })
  updatedAt: Date | null;
}
