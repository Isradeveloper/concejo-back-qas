import { IsEmail, IsNotEmpty, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
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

  @ApiProperty({
    description: 'Nueva contraseña del usuario',
    example: 'newPassword123',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword: string;
}

