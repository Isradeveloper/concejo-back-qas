import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWithPasswordDto {
  @ApiProperty({
    description: 'Correo electrónico',
    example: 'test@test.com',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña',
    example: '123456',
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;
}
