import { PrismaClient } from '@prisma/client';

export abstract class BaseSeeder {
  protected readonly prisma: PrismaClient;
  protected readonly name: string;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.name = this.constructor.name;
  }

  abstract seed(): Promise<void>;

  protected async checkIfSeeded(tableName: string, condition?: object): Promise<boolean> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const count = await (this.prisma as any)[tableName].count({
        where: condition,
      });
      return count > 0;
    } catch (error) {
      this.logWarn(`Could not check if ${tableName} is seeded: ${error.message}`);
      return false;
    }
  }

  protected logStart(): void {
    console.log(`[${this.name}] Starting seeding process...`);
  }

  protected logComplete(): void {
    console.log(`[${this.name}] Seeding completed successfully`);
  }

  protected logSkipped(): void {
    console.log(`[${this.name}] Seeding skipped - data already exists`);
  }

  protected logError(error: Error): void {
    console.error(`[${this.name}] Seeding failed: ${error.message}`);
    console.error(error.stack);
  }

  protected logWarn(message: string): void {
    console.warn(`[${this.name}] ${message}`);
  }

  protected logInfo(message: string): void {
    console.log(`[${this.name}] ${message}`);
  }
}
