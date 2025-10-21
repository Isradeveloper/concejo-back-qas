import { PrismaClient } from '@prisma/client';
import { BaseSeeder } from '../base/base-seeder';
import { ISeeder } from '../interfaces/seeder.interface';

export class DependenciesSeeder extends BaseSeeder implements ISeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async seed(): Promise<void> {
    this.logStart();

    try {
      const dependencies = [
        {
          name: 'Secretarías de despacho',
          status: true,
        },
        {
          name: 'Contralor',
          status: true,
        },
        {
          name: 'Personero',
          status: true,
        },
        {
          name: 'Entidades descentralizadas del conglomerado',
          status: true,
        },
      ];

      await Promise.all(
        dependencies.map(async (dependency) => {
          const existingDependency = await this.prisma.dependency.findFirst({
            where: { name: dependency.name },
          });
          if (existingDependency) {
            await this.prisma.dependency.update({
              where: { id: existingDependency.id },
              data: dependency,
            });
          } else {
            await this.prisma.dependency.create({ data: dependency });
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
