import { PrismaClient } from '@prisma/client';
import { ISeeder, SeederConfig, SeederConstructor } from './interfaces/seeder.interface';
import { DocumentTypesSeeder } from './seeder-runners/document-types.seeder';
import { UserTypesSeeder } from './seeder-runners/user-types.seeder';
import { DependenciesSeeder } from './seeder-runners/dependencies.seeder';
import { ParticipationMechanismsSeeder } from './seeder-runners/participation-mechanisms.seeder';
import { ProposalStatusesSeeder } from './seeder-runners/proposal-statuses.seeder';

export class SeederManager {
  private readonly prisma: PrismaClient;
  private readonly seeders: { seeder: ISeeder; config: SeederConfig }[] = [];

  constructor() {
    this.prisma = new PrismaClient();
    this.initializeSeeders();
  }

  private initializeSeeders(): void {
    const seederConfigs: { seeder: SeederConstructor; config: SeederConfig }[] = [
      {
        seeder: DocumentTypesSeeder,
        config: { name: 'DocumentTypes', priority: 1, enabled: true },
      },
      {
        seeder: UserTypesSeeder,
        config: { name: 'UserTypes', priority: 2, enabled: true },
      },
      {
        seeder: DependenciesSeeder,
        config: { name: 'Dependencies', priority: 3, enabled: true },
      },
      {
        seeder: ParticipationMechanismsSeeder,
        config: { name: 'ParticipationMechanisms', priority: 4, enabled: true },
      },
      {
        seeder: ProposalStatusesSeeder,
        config: { name: 'ProposalStatuses', priority: 5, enabled: true },
      },
    ];

    // Sort by priority and create instances
    seederConfigs
      .sort((a, b) => a.config.priority - b.config.priority)
      .forEach(({ seeder: SeederClass, config }) => {
        if (config.enabled) {
          this.seeders.push({
            seeder: new SeederClass(this.prisma),
            config,
          });
        }
      });
  }

  async runAllSeeders(): Promise<void> {
    console.log('🌱 Starting database seeding process...');
    console.log('=====================================');

    try {
      await this.prisma.$transaction(
        async (transaction) => {
          for (const { seeder, config } of this.seeders) {
            console.log(`\n🚀 Running seeder: ${config.name}`);

            const SeederClass = seeder.constructor as SeederConstructor;
            const transactionSeeder = new SeederClass(transaction as PrismaClient);

            await transactionSeeder.seed();
            console.log(`✅ Completed seeder: ${config.name}`);
          }
        },
        {
          timeout: 300000,
        },
      );

      console.log('\n=====================================');
      console.log('🎉 All seeders completed successfully!');
    } catch (error) {
      console.error('\n❌ Seeding failed, rolling back transaction...');
      console.error(error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async runSpecificSeeder(seederName: string): Promise<void> {
    const seederData = this.seeders.find(({ config }) => config.name === seederName);

    if (!seederData) {
      throw new Error(`Seeder '${seederName}' not found`);
    }

    console.log(`🌱 Running specific seeder: ${seederName}`);
    console.log('========================================');

    try {
      await this.prisma.$transaction(
        async (transaction) => {
          const SeederClass = seederData.seeder.constructor as SeederConstructor;
          const transactionSeeder = new SeederClass(transaction as PrismaClient);
          await transactionSeeder.seed();
        },
        {
          timeout: 60000,
        },
      );

      console.log(`\n✅ Seeder '${seederName}' completed successfully!`);
    } catch (error) {
      console.error(`\n❌ Seeder '${seederName}' failed, rolling back...`);
      console.error(error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async resetAll(): Promise<void> {
    console.log('🗑️  Resetting database...');
    console.log('==========================');

    try {
      await this.prisma.$transaction(async (transaction) => {
        console.log('Deleting subscription registers...');
        await transaction.subscriptionRegister.deleteMany();

        console.log('Deleting cite questions...');
        await transaction.citeQuestion.deleteMany();

        console.log('Deleting registration cites...');
        await transaction.registrationCite.deleteMany();

        console.log('Deleting proposal registers...');
        await transaction.proposalRegister.deleteMany();

        console.log('Deleting participation registers...');
        await transaction.participationRegister.deleteMany();

        console.log('Deleting registrations...');
        await transaction.registration.deleteMany();

        console.log('Deleting verification codes...');
        await transaction.verificationCode.deleteMany();

        console.log('Deleting simi inactive events...');
        await transaction.simiInactiveEvent.deleteMany();

        console.log('Deleting users...');
        await transaction.user.deleteMany();

        console.log('Deleting proposal statuses...');
        await transaction.proposalStatus.deleteMany();

        console.log('Deleting participation mechanisms...');
        await transaction.participationMechanism.deleteMany();

        console.log('Deleting dependencies...');
        await transaction.dependency.deleteMany();

        console.log('Deleting user types...');
        await transaction.userType.deleteMany();

        console.log('Deleting document types...');
        await transaction.documentType.deleteMany();
      });

      console.log('\n✅ Database reset completed successfully!');
    } catch (error) {
      console.error('\n❌ Database reset failed');
      console.error(error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async resetSeeders(): Promise<void> {
    console.log('🗑️  Resetting seeders...');
    console.log('==========================');

    try {
      await this.prisma.$transaction(async (transaction) => {
        await transaction.documentType.deleteMany();
        await transaction.documentType.deleteMany();
        await transaction.participationMechanism.deleteMany();
        await transaction.proposalStatus.deleteMany();
        await transaction.userType.deleteMany();
      });

      console.log('\n✅ Seeders reset completed successfully!');
    } catch (error) {
      console.error('\n❌ Resetting seeders failed');
      console.error(error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  getAvailableSeeders(): string[] {
    return this.seeders.map(({ config }) => config.name);
  }
}
