import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/application/services/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { CreateCitizenUserDto } from '../../application/dto/create-citizen-user.dto';
import { SaveCode } from 'src/modules/common/domain/interfaces/save-code.interface';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserTypeRepository } from './user-type.repository';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { PaginationUtil } from 'src/modules/common/infrastructure/utils/pagination.util';
import { CitedUser } from '../../domain/entities/cited-user.entity';

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userTypeRepository: UserTypeRepository,
    private readonly paginationUtil: PaginationUtil,
  ) {}

  async findOneByEmail(email: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userType: true, documentType: true, dependency: true },
    });
    if (!user) throw new NotFoundException('Credenciales incorrectas');
    return User.fromPrisma(user);
  }

  async findOneById(id: number, throwError: boolean = true): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userType: true, documentType: true, dependency: true },
    });
    if (!user && throwError) throw new NotFoundException(`Usuario no encontrado con id ${id}`);
    if (!user && !throwError) return null;
    return user ? User.fromPrisma(user) : null;
  }

  async validateUniqueEmail(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userType: true, documentType: true, dependency: true },
    });
    if (user) throw new BadRequestException(`Usuario ya existe con email ${email}`);
    return true;
  }

  async createCitizen(
    createCitizenUserDto: CreateCitizenUserDto,
    userTypeId: number,
    saveCode: SaveCode,
  ): Promise<User> {
    const user = await this.prisma.user.create({
      data: { ...createCitizenUserDto, userTypeId, VerificationCode: { create: saveCode } },
      include: { userType: true, documentType: true, dependency: true },
    });
    return User.fromPrisma(user);
  }

  async create(createUserDto: CreateUserDto, saveCode: SaveCode): Promise<User> {
    const user = await this.prisma.user.create({
      data: { ...createUserDto, VerificationCode: { create: saveCode } },
      include: { userType: true, documentType: true, dependency: true },
    });
    return User.fromPrisma(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { dependencyId, userTypeId, documentTypeId, ...userData } = updateUserDto;
    await this.findOneById(id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = { ...userData } as any;

    if (userTypeId && userTypeId !== 4) {
      data.dependency = { disconnect: true };
    } else if (dependencyId) {
      data.dependency = { connect: { id: dependencyId } };
    }

    if (userTypeId) {
      data.userType = { connect: { id: userTypeId } };
    }

    if (documentTypeId) {
      data.documentType = { connect: { id: documentTypeId } };
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: data,
      include: {
        userType: true,
        documentType: true,
        dependency: true,
      },
    });

    return User.fromPrisma(user);
  }

  async getUserPassword(id: number): Promise<string | null> {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: {
        password: true,
        userType: {
          select: {
            loginByCode: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException(`Usuario no encontrado con id ${id}`);

    if (user.userType.loginByCode)
      throw new NotFoundException('Este tipo de usuario no puede iniciar sesión con contraseña');

    return user.password;
  }

  async getAllUsers(paginationDto: PaginationDto): Promise<PaginationType<User>> {
    const orderBy = paginationDto.orderBy ?? 'id';
    const orderDirection = paginationDto.orderDirection ?? 'desc';

    return this.paginationUtil.getPaginatedPrismaData<User>({
      paginationDto,
      prismaQuery: () =>
        this.prisma.user
          .findMany({
            include: { userType: true, documentType: true, dependency: true },
            where: {
              OR: [
                { firstName: { contains: paginationDto.search, mode: 'insensitive' } },
                { lastName: { contains: paginationDto.search, mode: 'insensitive' } },
                { documentNumber: { contains: paginationDto.search, mode: 'insensitive' } },
                { email: { contains: paginationDto.search, mode: 'insensitive' } },
                { phoneNumber: { contains: paginationDto.search, mode: 'insensitive' } },
                { documentType: { name: { contains: paginationDto.search, mode: 'insensitive' } } },
                { userType: { name: { contains: paginationDto.search, mode: 'insensitive' } } },
                { dependency: { name: { contains: paginationDto.search, mode: 'insensitive' } } },
              ],
            },
            ...this.paginationUtil.getSkipAndTake(paginationDto),
            orderBy: {
              [orderBy]: orderDirection,
            },
          })
          .then((users) => users.map((user) => User.fromPrisma(user))),
      countQuery: () =>
        this.prisma.user.count({
          where: {
            OR: [
              { firstName: { contains: paginationDto.search, mode: 'insensitive' } },
              { lastName: { contains: paginationDto.search, mode: 'insensitive' } },
              { documentNumber: { contains: paginationDto.search, mode: 'insensitive' } },
              { email: { contains: paginationDto.search, mode: 'insensitive' } },
              { phoneNumber: { contains: paginationDto.search, mode: 'insensitive' } },
              { documentType: { name: { contains: paginationDto.search, mode: 'insensitive' } } },
              { userType: { name: { contains: paginationDto.search, mode: 'insensitive' } } },
              { dependency: { name: { contains: paginationDto.search, mode: 'insensitive' } } },
            ],
          },
        }),
    });
  }

  async delete(id: number): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
      include: { userType: true, documentType: true, dependency: true },
    });
    return User.fromPrisma(user);
  }

  async getCitedUsers(): Promise<CitedUser[]> {
    const citedUserType = await this.userTypeRepository.findOneByName('Citados');

    const users = await this.prisma.user.findMany({
      where: {
        userTypeId: citedUserType.id,
        status: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        documentNumber: true,
        phoneNumber: true,
        userType: {
          select: {
            id: true,
            name: true,
          },
        },
        documentType: {
          select: {
            id: true,
            name: true,
            abbreviation: true,
          },
        },
        dependency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        firstName: 'asc',
      },
    });

    return users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName || null,
      email: user.email,
      documentNumber: user.documentNumber,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      documentType: user.documentType,
      dependency: user.dependency || null,
    }));
  }

  async validateCitedUsersExist(userIds: number[]): Promise<void> {
    const citedUserType = await this.userTypeRepository.findOneByName('Citados');

    const existingUsers = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        userTypeId: citedUserType.id,
        status: true,
      },
      select: { id: true },
    });

    const existingUserIds = existingUsers.map((user) => user.id);
    const nonExistentUserIds = userIds.filter((id) => !existingUserIds.includes(id));

    if (nonExistentUserIds.length > 0) {
      throw new BadRequestException(
        `Los siguientes usuarios no existen o no son de tipo 'Citados': ${nonExistentUserIds.join(', ')}`,
      );
    }
  }
}
