import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class ChangeProposalStatusDto {
  @ApiProperty({
    description: 'The new proposal status ID',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  proposalStatusId: number;
}
