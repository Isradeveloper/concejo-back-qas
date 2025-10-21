import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Dependency as PrismaDependency } from '@prisma/client';

export class UserDependency {
  static fromPrisma(dependency: PrismaDependency): UserDependency {
    return {
      ...dependency,
    } as UserDependency;
  }

  @ApiProperty({
    description: 'The id of the user dependency',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the user dependency',
    example: 'Ciudadano',
  })
  name: string;

  @ApiProperty({
    description: 'The status of the user dependency',
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'The created at of the user dependency',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The updated at of the user dependency',
    example: new Date(),
  })
  updatedAt?: Date;
}
