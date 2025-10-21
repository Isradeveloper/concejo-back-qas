import { PrismaClient } from '@prisma/client';
import { BaseSeeder } from '../base/base-seeder';
import { ISeeder } from '../interfaces/seeder.interface';

export class DocumentTypesSeeder extends BaseSeeder implements ISeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async seed(): Promise<void> {
    this.logStart();

    try {
      const documentTypes = [
        {
          name: 'Cédula de Ciudadanía',
          abbreviation: 'CC',
          status: true,
        },
        {
          name: 'Cédula de Extranjería',
          abbreviation: 'CE',
          status: true,
        },
        {
          name: 'Pasaporte',
          abbreviation: 'PP',
          status: true,
        },
      ];

      await Promise.all(
        documentTypes.map(async (documentType) => {
          const existingDocumentType = await this.prisma.documentType.findFirst({
            where: { name: documentType.name },
          });
          if (existingDocumentType) {
            await this.prisma.documentType.update({
              where: { id: existingDocumentType.id },
              data: documentType,
            });
          } else {
            await this.prisma.documentType.create({ data: documentType });
          }
        }),
      );

      this.logComplete();
    } catch (error) {
      this.logError(error as Error);
      throw error;
    }
  }
}
