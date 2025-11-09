import { PrismaClient } from '@prisma/client';
import { BaseSeeder } from '../base/base-seeder';
import { ISeeder } from '../interfaces/seeder.interface';
import { envVars } from '../../../src/config/envs';
import bcrypt from 'bcrypt';

export class AdminUserSeeder extends BaseSeeder implements ISeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async seed(): Promise<void> {
    this.logStart();

    try {
      const adminUserType = await this.prisma.userType.findFirst({
        where: { name: 'Administrador' },
      });

      if (!adminUserType) {
        throw new Error('UserType "Administrador" not found. Please run UserTypesSeeder first.');
      }

      const documentType = await this.prisma.documentType.findFirst({
        where: { name: 'Cédula de Ciudadanía' },
      });

      if (!documentType) {
        throw new Error('DocumentType "Cédula de Ciudadanía" not found. Please run DocumentTypesSeeder first.');
      }

      const hashedPassword = await bcrypt.hash(envVars.ADMIN_PASSWORD, 10);

      const existingUser = await this.prisma.user.findUnique({
        where: { email: envVars.ADMIN_EMAIL },
      });

      const userData = {
        email: envVars.ADMIN_EMAIL,
        password: hashedPassword,
        firstName: 'Administrador',
        documentNumber: '1234567890',
        phoneNumber: '1234567890',
        userTypeId: adminUserType.id,
        documentTypeId: documentType.id,
        status: true,
        emailVerified: true,
      };

      if (existingUser) {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: userData,
        });
        this.logInfo('Admin user updated successfully');
      } else {
        await this.prisma.user.create({
          data: userData,
        });
        this.logInfo('Admin user created successfully');
      }

      this.logComplete();
    } catch (error) {
      this.logError(error as Error);
      throw error;
    }
  }
}
