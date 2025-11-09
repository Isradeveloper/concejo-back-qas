import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { CreateRegistrationDto } from './create-registration.dto';

export class CreateSubscriptionRegisterDto extends CreateRegistrationDto {
  @ApiProperty({
    description: 'The simi topic id',
    example: '1',
  })
  @IsNotEmpty({ message: 'El ID del tema de interés es requerido' })
  @IsString({ message: 'El ID del tema de interés debe ser una cadena de texto' })
  simiTopicId: string;
}
