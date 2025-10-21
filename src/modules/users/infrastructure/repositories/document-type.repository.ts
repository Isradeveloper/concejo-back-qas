import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/application/services/prisma.service';
import { DocumentType } from '../../domain/entities/document-type.entity';

@Injectable()
export class DocumentTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByName(name: string): Promise<DocumentType> {
    const documentType = await this.prisma.documentType.findFirst({ where: { name } });
    if (!documentType) throw new NotFoundException(`Tipo de documento no encontrado con nombre ${name}`);
    return DocumentType.fromPrisma(documentType);
  }

  async findOneById(id: number): Promise<DocumentType> {
    const documentType = await this.prisma.documentType.findFirst({ where: { id } });
    if (!documentType) throw new NotFoundException(`Tipo de documento no encontrado con id ${id}`);
    return DocumentType.fromPrisma(documentType);
  }

  async getAll(): Promise<DocumentType[]> {
    const documentTypes = await this.prisma.documentType.findMany();
    return documentTypes.map((documentType) => DocumentType.fromPrisma(documentType));
  }
}
