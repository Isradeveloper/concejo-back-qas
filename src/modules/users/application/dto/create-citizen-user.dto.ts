import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsPositive, Length } from 'class-validator';

export class CreateCitizenUserDto {
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
}
