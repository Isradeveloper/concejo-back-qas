import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';

export class GetProposalsByCitationsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Estado de la propuesta',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  proposalStatusId?: number;
}
