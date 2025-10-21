import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/application/services/prisma.service';
import { UserDependency } from '../../domain/entities/user-dependency.entity';

@Injectable()
export class DependencyRepository {
  constructor(private readonly prisma: PrismaService) {}
  async findOneById(id: number): Promise<UserDependency> {
    const dependency = await this.prisma.dependency.findFirst({ where: { id } });
    if (!dependency) throw new NotFoundException(`Dependencia no encontrada con id ${id}`);
    return UserDependency.fromPrisma(dependency);
  }

  async getAll(): Promise<UserDependency[]> {
    const dependencies = await this.prisma.dependency.findMany();
    return dependencies.map((dependency) => UserDependency.fromPrisma(dependency));
  }
}
