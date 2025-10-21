import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType as PrismaUserType } from '@prisma/client';

export class UserType {
  static fromPrisma(userType: PrismaUserType): UserType {
    return {
      ...userType,
    } as UserType;
  }

  @ApiProperty({
    description: 'The id of the user type',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the user type',
    example: 'Ciudadano',
  })
  name: string;

  @ApiProperty({
    description: 'The login by code of the user type',
    example: true,
  })
  loginByCode: boolean;

  @ApiProperty({
    description: 'The status of the user type',
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'The created at of the user type',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The updated at of the user type',
    example: new Date(),
  })
  updatedAt?: Date;
}
