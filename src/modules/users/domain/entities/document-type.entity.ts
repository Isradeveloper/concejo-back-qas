import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType as PrismaDocumentType } from '@prisma/client';

export class DocumentType {
  static fromPrisma(documentType: PrismaDocumentType): DocumentType {
    return {
      ...documentType,
    } as DocumentType;
  }

  @ApiProperty({
    description: 'ID del tipo de documento',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Nombre del tipo de documento',
    example: 'Cédula de Ciudadanía',
  })
  name: string;

  @ApiProperty({
    description: 'Abreviatura del tipo de documento',
    example: 'CC',
  })
  abbreviation: string;

  @ApiProperty({
    description: 'Estado del tipo de documento',
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'Fecha de creación del tipo de documento',
    example: new Date(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Fecha de actualización del tipo de documento',
    example: new Date(),
  })
  updatedAt?: Date;
}
