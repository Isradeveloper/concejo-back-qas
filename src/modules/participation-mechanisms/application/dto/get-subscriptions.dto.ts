import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';

export class GetSubscriptionsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Topic name to filter subscriptions',
    example: 'salud',
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({
    description: 'User ID to filter subscriptions',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  userId?: number;

  @ApiPropertyOptional({
    description: 'User first name to filter subscriptions',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name to filter subscriptions',
    example: 'Perez',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'User email to filter subscriptions',
    example: 'juan@example.com',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'User document number to filter subscriptions',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  documentNumber?: string;
}
