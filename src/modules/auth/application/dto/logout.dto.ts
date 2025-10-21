import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LogoutDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsInt({ message: 'El user ID debe ser un número entero' })
  @IsPositive({ message: 'El user ID debe ser un número positivo' })
  @IsNotEmpty({ message: 'El user ID es requerido' })
  userId: number;
}
