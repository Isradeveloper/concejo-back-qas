import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsEmail } from 'class-validator';
import { CreateRegistrationDto } from './create-registration.dto';

export class CreateParticipationRegisterDto extends CreateRegistrationDto {
  @ApiProperty({
    example: true,
  })
  @IsNotEmpty({ message: 'El usuario propio es requerido' })
  @IsBoolean({ message: 'El usuario propio debe ser un booleano' })
  ownUser: boolean;

  @ApiPropertyOptional({
    example: 'Organization Name',
  })
  @IsOptional()
  @IsString({ message: 'El nombre de la organización debe ser una cadena de texto' })
  organizationName?: string;

  @ApiPropertyOptional({
    example: '1234567890',
  })
  @IsOptional()
  @IsString({ message: 'El nit de la organización debe ser una cadena de texto' })
  organizationNit?: string;

  @ApiPropertyOptional({
    example: 'Organization Email',
  })
  @IsOptional()
  @IsString({ message: 'El correo de la organización debe ser una cadena de texto' })
  @IsEmail({}, { message: 'El correo de la organización debe ser un correo electrónico válido' })
  organizationEmail?: string;

  @ApiPropertyOptional({
    example: 'Organization Role',
  })
  @IsOptional()
  @IsString({ message: 'El rol de la organización debe ser una cadena de texto' })
  organizationRole?: string;
}
