import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';

export class GetEventsDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Event type filter',
    example: 'plenary_session',
  })
  @IsOptional()
  @IsString()
  type?: string;
}
