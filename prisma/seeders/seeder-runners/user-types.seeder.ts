import { PrismaClient } from '@prisma/client';
import { BaseSeeder } from '../base/base-seeder';
import { ISeeder } from '../interfaces/seeder.interface';

export class UserTypesSeeder extends BaseSeeder implements ISeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async seed(): Promise<void> {
    this.logStart();

    try {
      const userTypes = [
        {
          name: 'Administrador',
          loginByCode: false,
          status: true,
        },
        {
          name: 'Visualizador',
          loginByCode: false,
          status: true,
        },
        {
          name: 'Ciudadano',
          loginByCode: true,
          status: true,
        },
        {
          name: 'Citados',
          loginByCode: false,
          status: true,
        },
      ];

      await Promise.all(
        userTypes.map(async (userType) => {
          const existingUserType = await this.prisma.userType.findFirst({
            where: { name: userType.name },
          });
          if (existingUserType) {
            await this.prisma.userType.update({
              where: { id: existingUserType.id },
              data: userType,
            });
          } else {
            await this.prisma.userType.create({ data: userType });
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
