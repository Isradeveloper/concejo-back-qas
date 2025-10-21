import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'El refresh token debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El refresh token es requerido' })
  refreshToken: string;

  @ApiProperty({
    description: 'User ID',
    example: 1,
  })
  @IsNumber({}, { message: 'El user ID debe ser un número' })
  @IsNotEmpty({ message: 'El user ID es requerido' })
  userId: number;
}
