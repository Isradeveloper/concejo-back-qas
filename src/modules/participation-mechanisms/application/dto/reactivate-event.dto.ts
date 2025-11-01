import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ReactivateEventDto {
  @ApiProperty({
    description: 'El codigo del evento SIMI',
    example: 'EVT001',
  })
  @IsString()
  @IsNotEmpty()
  simiEventCode: string;
}
