import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { DocumentType } from '../../domain/entities/document-type.entity';
import { DocumentTypeService } from '../../application/services/document-type.service';

@ApiTags('document-types')
@Controller('document-types')
export class DocumentTypesController {
  constructor(private readonly documentTypeService: DocumentTypeService) {}

  @Get()
  @ApiOkResponse({ type: DocumentType, isArray: true })
  findAll(): Promise<DocumentType[]> {
    return this.documentTypeService.getAll();
  }
}
