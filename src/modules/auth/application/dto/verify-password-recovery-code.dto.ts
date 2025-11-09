import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyPasswordRecoveryCodeDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'test@test.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Código de recuperación de contraseña enviado al correo electrónico del usuario',
    example: '123456',
    minLength: 6,
    maxLength: 6,
  })
  @IsNotEmpty({ message: 'Código de verificación es requerido' })
  @IsString({ message: 'Código de verificación debe ser una cadena de texto' })
  @Length(6, 6, { message: 'Código de verificación debe tener exactamente 6 caracteres' })
  code: string;
}

