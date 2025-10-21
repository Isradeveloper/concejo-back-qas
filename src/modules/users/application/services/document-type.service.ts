import { Injectable } from '@nestjs/common';
import { DocumentTypeRepository } from '../../infrastructure/repositories/document-type.repository';
import { DocumentType } from '../../domain/entities/document-type.entity';

@Injectable()
export class DocumentTypeService {
  constructor(private readonly documentTypeRepository: DocumentTypeRepository) {}

  async findOneByName(name: string): Promise<DocumentType> {
    return await this.documentTypeRepository.findOneByName(name);
  }

  async getAll(): Promise<DocumentType[]> {
    return await this.documentTypeRepository.getAll();
  }

  async findOneById(id: number): Promise<DocumentType> {
    return await this.documentTypeRepository.findOneById(id);
  }
}
