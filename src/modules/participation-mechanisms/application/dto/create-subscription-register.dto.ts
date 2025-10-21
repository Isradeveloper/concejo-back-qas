import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { CreateRegistrationDto } from './create-registration.dto';

export class CreateSubscriptionRegisterDto extends CreateRegistrationDto {
  @ApiPropertyOptional({
    example: 'Organization Role',
  })
  @IsOptional()
  @IsString({ message: 'El rol de la suscripción debe ser una cadena de texto' })
  organizationRole?: string;
}
