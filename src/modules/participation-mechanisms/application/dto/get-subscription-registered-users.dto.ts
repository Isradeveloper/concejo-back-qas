import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';

export class GetSubscriptionRegisteredUsersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Topic name to filter subscriptions',
    example: 'salud',
  })
  @IsOptional()
  @IsString()
  topic?: string;
}
