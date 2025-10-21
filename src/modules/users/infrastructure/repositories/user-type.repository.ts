import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/application/services/prisma.service';
import { UserType } from '../../domain/entities/user-type.entity';

@Injectable()
export class UserTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByName(name: string): Promise<UserType> {
    const userType = await this.prisma.userType.findFirst({ where: { name } });
    if (!userType) throw new NotFoundException(`Tipo de usuario no encontrado con nombre ${name}`);
    return UserType.fromPrisma(userType);
  }

  async findOneById(id: number): Promise<UserType> {
    const userType = await this.prisma.userType.findFirst({ where: { id } });
    if (!userType) throw new NotFoundException(`Tipo de usuario no encontrado con id ${id}`);
    return UserType.fromPrisma(userType);
  }

  async getAll(): Promise<UserType[]> {
    const userTypes = await this.prisma.userType.findMany();
    return userTypes.map((userType) => UserType.fromPrisma(userType));
  }
}
