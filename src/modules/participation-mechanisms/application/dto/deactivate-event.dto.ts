import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeactivateEventDto {
  @ApiProperty({
    description: 'El codigo del evento SIMI',
    example: 'EVT001',
  })
  @IsString()
  @IsNotEmpty()
  simiEventCode: string;
}
