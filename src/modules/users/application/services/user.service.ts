import { Injectable } from '@nestjs/common';
import { CreateCitizenUserDto } from '../dto/create-citizen-user.dto';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { SaveCode } from 'src/modules/common/domain/interfaces/save-code.interface';
import { UpdateUserDto } from '../dto/update-user.dto';
import { MailerService } from 'src/modules/common/application/services/mailer.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { CodeService } from 'src/modules/common/application/services/code.service';
import { DocumentTypeService } from './document-type.service';
import { UserTypeService } from './user-type.service';
import bcrypt from 'bcrypt';
import { PaginationDto } from 'src/modules/common/application/dto/pagination.dto';
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { DependencyService } from './dependency.service';
import { CitedUser } from '../../domain/entities/cited-user.entity';
@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mailerService: MailerService,
    private readonly codeService: CodeService,
    private readonly documentTypeService: DocumentTypeService,
    private readonly userTypeService: UserTypeService,
    private readonly dependencyService: DependencyService,
  ) {}

  async validateUniqueEmail(email: string): Promise<boolean> {
    return await this.userRepository.validateUniqueEmail(email);
  }

  async findOneByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneByEmail(email);
  }

  async findOneById(id: number, throwError: boolean = true): Promise<User | null> {
    return await this.userRepository.findOneById(id, throwError);
  }

  async createCitizen({
    createCitizenUserDto,
    userTypeId,
    saveCode,
  }: {
    createCitizenUserDto: CreateCitizenUserDto;
    userTypeId: number;
    saveCode: SaveCode;
  }): Promise<User> {
    await this.validateUniqueEmail(createCitizenUserDto.email);

    const user = await this.userRepository.createCitizen(createCitizenUserDto, userTypeId, saveCode);

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.validateUniqueEmail(createUserDto.email);

    await this.documentTypeService.findOneById(createUserDto.documentTypeId);

    await this.userTypeService.findOneById(createUserDto.userTypeId);

    if (createUserDto.dependencyId) {
      await this.dependencyService.findOneById(createUserDto.dependencyId);
    }

    const saveCode = this.codeService.generateSaveCode('isVerification');

    if (createUserDto.password) {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    }

    const user = await this.userRepository.create(createUserDto, saveCode);

    await this.mailerService.sendEmail({
      to: user.email,
      subject: 'Código de verificación',
      htmlBody: `Tu código de verificación es: ${saveCode.code}`,
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = updateUserDto;

    if (userData.documentTypeId) {
      await this.documentTypeService.findOneById(userData.documentTypeId);
    }
    if (userData.userTypeId) {
      await this.userTypeService.findOneById(userData.userTypeId);
    }

    return await this.userRepository.update(id, { ...userData });
  }

  async getUserPassword(id: number): Promise<string | null> {
    return await this.userRepository.getUserPassword(id);
  }

  async getAllUsers(paginationDto: PaginationDto): Promise<PaginationType<User>> {
    return await this.userRepository.getAllUsers(paginationDto);
  }

  async delete(id: number): Promise<User> {
    await this.findOneById(id);
    return await this.userRepository.delete(id);
  }

  async getCitedUsers(): Promise<CitedUser[]> {
    return await this.userRepository.getCitedUsers();
  }

  async validateCitedUsersExist(userIds: number[]): Promise<void> {
    return await this.userRepository.validateCitedUsersExist(userIds);
  }
}
