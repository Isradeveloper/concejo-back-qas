import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';

export class GetUsersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'ID del tipo de usuario para filtrar',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  userTypeId?: number;
}

