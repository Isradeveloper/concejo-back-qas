import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetEventRegisteredUsersDto {
  @ApiPropertyOptional({
    description: 'Search term for filtering users by name or email',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Order by',
    example: 'name',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({
    description: 'Order direction',
    example: 'asc',
  })
  @IsOptional()
  @IsString()
  orderDirection?: string;
}
