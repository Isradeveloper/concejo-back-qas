import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VerificationCode as PrismaVerificationCode } from '@prisma/client';

export class VerificationCode {
  static fromPrisma(user: PrismaVerificationCode): VerificationCode {
    return {
      ...user,
    } as VerificationCode;
  }

  @ApiProperty({
    description: 'The id of the verification code',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The user id of the verification code',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: 'The code of the verification code',
    example: '123456',
  })
  code: string;

  @ApiProperty({
    description: 'Is login verification code',
    example: true,
  })
  isLogin: boolean;

  @ApiProperty({
    description: 'Is verification code',
    example: true,
  })
  isVerification: boolean;

  @ApiProperty({
    description: 'Is password recovery code',
    example: true,
  })
  isPasswordRecovery: boolean;

  @ApiProperty({
    description: 'The expires at of the verification code',
    example: new Date(),
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'The used status of the verification code',
    example: true,
  })
  used: boolean;

  @ApiProperty({
    description: 'The created at of the verification code',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The updated at of the verification code',
    example: new Date(),
  })
  updatedAt?: Date;
}
