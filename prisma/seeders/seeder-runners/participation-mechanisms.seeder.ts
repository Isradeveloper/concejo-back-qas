import { PrismaClient } from '@prisma/client';
import { BaseSeeder } from '../base/base-seeder';
import { ISeeder } from '../interfaces/seeder.interface';

export class ParticipationMechanismsSeeder extends BaseSeeder implements ISeeder {
  constructor(prisma: PrismaClient) {
    super(prisma);
  }

  async seed(): Promise<void> {
    this.logStart();

    try {
      const mechanisms = [
        {
          name: 'Sesiones plenarias',
          description: '',
          icon: 'sesiones-plenarias',
          status: true,
          type: 'plenary-session',
        },
        {
          name: 'Comisiones accidentales',
          description: '',
          icon: 'comision-accidental',
          status: true,
          type: 'accidental-commission',
        },
        {
          name: 'Participación en 1er debate',
          description: '',
          subtitle: 'Proyecto de acuerdo',
          icon: 'participacion-primer-debate',
          status: true,
          type: 'first-debate',
        },
        {
          name: 'Participación en reunión de estudio',
          description: '',
          subtitle: 'Proyecto de acuerdo',
          icon: 'reunion-estudio',
          status: true,
          type: 'study-meeting',
        },
        {
          name: 'Propuestas ciudadanas para el control político',
          description: '',
          icon: 'control-politico',
          status: true,
          type: 'political-control',
        },
        {
          name: 'Registro de temas de interés y remisión de proyectos',
          description: '',
          icon: 'remision',
          status: true,
          type: 'interest-topic-and-referral',
        },
      ];

      await Promise.all(
        mechanisms.map(async (mechanism) => {
          const existingMechanism = await this.prisma.participationMechanism.findFirst({
            where: { name: mechanism.name },
          });
          if (existingMechanism) {
            await this.prisma.participationMechanism.update({
              where: { id: existingMechanism.id },
              data: mechanism,
            });
          } else {
            await this.prisma.participationMechanism.create({ data: mechanism });
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
