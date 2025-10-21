import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsInt, IsPositive, IsString, IsOptional, IsDate, ValidateNested, IsArray } from 'class-validator';

export class MemberDto {
  @ApiProperty({
    description: 'El nombre del miembro',
    example: 'Juan Perez',
  })
  @IsString({ message: 'El nombre del miembro debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del miembro es requerido' })
  name: string;

  @ApiProperty({
    description: 'La bancada del miembro',
  })
  @IsNotEmpty({ message: 'La bancada del miembro es requerida' })
  @IsString({ message: 'La bancada del miembro debe ser una cadena de texto' })
  bench: string;
}

export class CreateRegistrationDto {
  @ApiProperty({
    description: 'El ID del usuario',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del usuario es requerido' })
  @IsInt({ message: 'El ID del usuario debe ser un número' })
  @IsPositive({ message: 'El ID del usuario debe ser un número positivo' })
  userId: number;

  @ApiProperty({
    description: 'El ID del mecanismo de participación',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del mecanismo de participación es requerido' })
  @IsInt({ message: 'El ID del mecanismo de participación debe ser un número' })
  @IsPositive({ message: 'El ID del mecanismo de participación debe ser un número positivo' })
  participationMechanismId: number;

  @ApiProperty({
    description: 'El código del evento simi',
    example: 'abc123',
  })
  @IsOptional({ message: 'El código del evento simi es opcional' })
  @IsString({ message: 'El código del evento simi debe ser una cadena de texto' })
  simiEventCode: string | null;

  @ApiProperty({
    description: 'El tipo de evento',
    example: 'plenary-session',
  })
  @IsOptional({ message: 'El tipo de evento es opcional' })
  @IsString({ message: 'El tipo de evento debe ser una cadena de texto' })
  type: string | null;

  @ApiProperty({
    description: 'La descripción del evento',
    example: 'Descripción del evento',
  })
  @IsOptional({ message: 'La descripción del evento es opcional' })
  @IsString({ message: 'La descripción del evento debe ser una cadena de texto' })
  description: string | null;

  @ApiProperty({
    description: 'La fecha del evento',
    example: '2025-01-01',
  })
  @IsOptional({ message: 'La fecha del evento es opcional' })
  @IsDate({ message: 'La fecha del evento debe ser una fecha' })
  @Type(() => Date)
  date: Date | null;

  @ApiProperty({
    description: 'La hora del evento',
    example: '10:00',
  })
  @IsOptional({ message: 'La hora del evento es opcional' })
  @IsString({ message: 'La hora del evento debe ser una cadena de texto' })
  hour: string | null;

  @ApiProperty({
    description: 'El lugar del evento',
    example: 'Lugar del evento',
  })
  @IsOptional({ message: 'El lugar del evento es opcional' })
  @IsString({ message: 'El lugar del evento debe ser una cadena de texto' })
  place: string | null;

  @ApiProperty({
    description: 'El tema del evento',
    example: 'Tema del evento',
  })
  @IsOptional({ message: 'El tema del evento es opcional' })
  @IsString({ message: 'El tema del evento debe ser una cadena de texto' })
  topic: string | null;

  @ApiProperty({
    description: 'El profesional especializado del evento',
    example: 'Profesional especializado del evento',
  })
  @IsOptional({ message: 'El profesional especializado del evento es opcional' })
  @IsString({ message: 'El profesional especializado del evento debe ser una cadena de texto' })
  specializedProfessional: string | null;

  @ApiProperty({
    description: 'El coordinador del evento',
    example: 'Coordinador del evento',
  })
  @IsOptional({ message: 'El coordinador del evento es opcional' })
  @IsString({ message: 'El coordinador del evento debe ser una cadena de texto' })
  coordinator: string | null;

  @ApiProperty({
    description: 'Los miembros del evento',
    isArray: true,
    example: [
      {
        name: 'Juan Perez',
        bench: 'Bancaria',
      },
    ],
  })
  @IsOptional({ message: 'Los miembros del evento es opcional' })
  @IsArray({ message: 'Los miembros del evento deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => MemberDto)
  members: MemberDto[] = [];

  @ApiProperty({
    description: 'Los ponentes del evento',
    isArray: true,
    example: ['Juan Perez', 'Maria Garcia'],
  })
  @IsOptional({ message: 'Los ponentes del evento son opcionales' })
  @IsArray({ message: 'Los ponentes del evento deben ser un array' })
  @IsString({ each: true, message: 'Los ponentes del evento deben ser una cadena de texto' })
  speakers: string[] = [];
}
