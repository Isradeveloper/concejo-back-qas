import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Correo electrónico',
    example: 'test@test.com',
  })
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @ApiProperty({
    description: 'Primer nombre',
    example: 'John',
  })
  @IsNotEmpty({ message: 'El primer nombre es requerido' })
  firstName: string;

  @ApiProperty({
    description: 'Primer apellido',
    example: 'Doe',
  })
  @IsNotEmpty({ message: 'El primer apellido es requerido' })
  lastName: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: '123456',
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;

  @ApiProperty({
    description: 'Número de documento',
    example: '1234567890',
  })
  @IsNotEmpty({ message: 'El número de documento es requerido' })
  documentNumber: string;

  @ApiProperty({
    description: 'Número de celular',
    example: '1234567890',
  })
  @IsNotEmpty({ message: 'El número de celular es requerido' })
  @Length(10, 10, { message: 'El número de celular debe tener exactamente 10 caracteres' })
  phoneNumber: string;

  @ApiProperty({
    description: 'ID Tipo de documento',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID Tipo de documento es requerido' })
  @IsInt({ message: 'El ID Tipo de documento debe ser un número' })
  @IsPositive({ message: 'El ID Tipo de documento debe ser un número positivo' })
  documentTypeId: number;

  @ApiProperty({
    description: 'ID Tipo de usuario',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID Tipo de usuario es requerido' })
  @IsInt({ message: 'El ID Tipo de usuario debe ser un número' })
  @IsPositive({ message: 'El ID Tipo de usuario debe ser un número positivo' })
  userTypeId: number;

  @ApiPropertyOptional({
    description: 'ID Dependencia',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'El ID Dependencia debe ser un número' })
  @IsPositive({ message: 'El ID Dependencia debe ser un número positivo' })
  dependencyId?: number;
}
