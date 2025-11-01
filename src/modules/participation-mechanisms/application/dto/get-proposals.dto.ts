import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';

export class GetProposalsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Estado de la propuesta',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  proposalStatusId?: number;

  @ApiPropertyOptional({
    description: 'ID del usuario para filtrar las propuestas creadas por el usuario',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;
}
