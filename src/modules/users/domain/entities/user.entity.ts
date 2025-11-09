import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  User as PrismaUser,
  UserType as PrismaUserType,
  DocumentType as PrismaDocumentType,
  Dependency as PrismaDependency,
} from '@prisma/client';
import { UserType } from './user-type.entity';
import { DocumentType } from './document-type.entity';
import { UserDependency } from './user-dependency.entity';

export class User {
  static fromPrisma(
    user: PrismaUser & {
      userType: PrismaUserType;
      documentType: PrismaDocumentType;
      dependency: PrismaDependency | null;
    },
  ): User {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      userType: UserType.fromPrisma(user.userType),
      documentType: DocumentType.fromPrisma(user.documentType),
      dependency: user.dependency ? UserDependency.fromPrisma(user.dependency) : null,
    } as User;
  }

  @ApiProperty({
    description: 'The id of the user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Correo electrónico',
    example: 'test@test.com',
  })
  email: string;

  @ApiProperty({
    description: 'Primer nombre',
    example: 'John',
  })
  firstName: string;

  @ApiPropertyOptional({
    description: 'Primer apellido',
    example: 'Doe',
  })
  lastName?: string | null;

  @ApiProperty({
    description: 'Número de documento',
    example: '1234567890',
  })
  documentNumber: string;

  @ApiProperty({
    description: 'Número de celular',
    example: '1234567890',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'Estado del usuario',
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha de actualización del usuario',
    example: new Date(),
  })
  updatedAt?: Date;

  @ApiPropertyOptional({
    description: 'Fecha de eliminación del usuario',
    example: new Date(),
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'ID Tipo de usuario',
    example: 1,
  })
  userTypeId: number;

  @ApiProperty({
    description: 'ID Tipo de documento',
    example: 1,
  })
  documentTypeId: number;

  @ApiPropertyOptional({
    description: 'ID Dependencia',
    example: 1,
  })
  dependencyId?: number | null;

  @ApiProperty({
    description: 'Estado de verificación de correo electrónico',
    example: true,
  })
  emailVerified: boolean;

  @ApiPropertyOptional({
    description: 'Refresh token del usuario',
    example: '1234567890',
  })
  refreshToken?: string | null;

  @ApiProperty({
    description: 'Tipo de usuario',
    example: {
      id: 1234,
      name: 'Ciudadano',
      loginByCode: true,
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  userType: UserType;

  @ApiProperty({
    description: 'Tipo de documento',
    example: {
      id: 1234,
      name: 'Cédula',
      abbreviation: 'CC',
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  documentType: DocumentType;

  @ApiPropertyOptional({
    description: 'Dependencia del usuario',
    example: {
      id: 1234,
      name: 'Secretaría de Gobierno',
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  dependency?: UserDependency | null;
}

export class UserWithToken extends User {
  @ApiProperty({
    description: 'JWT token del usuario',
    example: '1234567890',
  })
  token: string;
}
