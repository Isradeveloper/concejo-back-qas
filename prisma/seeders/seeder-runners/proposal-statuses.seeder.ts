import { PrismaClient } from '@prisma/client';
import { BaseSeeder } from '../base/base-seeder';
import { ISeeder } from '../interfaces/seeder.interface';

export class ProposalStatusesSeeder extends BaseSeeder implements ISeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async seed(): Promise<void> {
    this.logStart();

    try {
      const statuses = [
        {
          name: 'Creada',
          status: true,
        },
        {
          name: 'Aprobada',
          status: true,
        },
      ];

      await Promise.all(
        statuses.map(async (status) => {
          const existingStatus = await this.prisma.proposalStatus.findFirst({
            where: { name: status.name },
          });
          if (existingStatus) {
            await this.prisma.proposalStatus.update({
              where: { id: existingStatus.id },
              data: status,
            });
          } else {
            await this.prisma.proposalStatus.create({ data: status });
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
