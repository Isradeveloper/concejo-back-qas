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
import { PaginationType } from 'src/modules/common/domain/interfaces/pagination.interface';
import { DependencyService } from './dependency.service';
import { CitedUser } from '../../domain/entities/cited-user.entity';
import { GetUsersDto } from '../dto/get-users.dto';
import { MailTemplate } from 'src/modules/common/infrastructure/utils/mail-templates.util';
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

  async validateUniqueDocumentNumber(
    documentNumber: string,
    documentTypeId: number,
    excludeUserId?: number,
  ): Promise<boolean> {
    return await this.userRepository.validateUniqueDocumentNumber(documentNumber, documentTypeId, excludeUserId);
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

    await this.validateUniqueDocumentNumber(createCitizenUserDto.documentNumber, createCitizenUserDto.documentTypeId);

    const user = await this.userRepository.createCitizen(createCitizenUserDto, userTypeId, saveCode);

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    await this.validateUniqueEmail(createUserDto.email);

    await this.documentTypeService.findOneById(createUserDto.documentTypeId);

    await this.validateUniqueDocumentNumber(createUserDto.documentNumber, createUserDto.documentTypeId);

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
      htmlBody: new MailTemplate(
        'Código de verificación',
        `<div style="text-align: center;"><span style="font-size: 15px;">Hola ${user.firstName} ${user.lastName} 👋, te compartimos tu código de verificación: </span> <br/> <br/> <span style="font-size: 25px; font-weight: bold;">${saveCode.code}</span></div>`,
      ).render(),
    });

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userData } = updateUserDto;

    if (userData.documentTypeId) {
      await this.documentTypeService.findOneById(userData.documentTypeId);
    }

    if (userData.documentNumber || userData.documentTypeId) {
      const existingUser = await this.findOneById(id);
      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }
      const documentNumber = userData.documentNumber ?? existingUser.documentNumber;
      const documentTypeId = userData.documentTypeId ?? existingUser.documentTypeId;
      await this.validateUniqueDocumentNumber(documentNumber, documentTypeId, id);
    }

    if (userData.userTypeId) {
      await this.userTypeService.findOneById(userData.userTypeId);
    }

    return await this.userRepository.update(id, { ...userData });
  }

  async getUserPassword(id: number): Promise<string | null> {
    return await this.userRepository.getUserPassword(id);
  }

  async userHasPassword(id: number): Promise<boolean> {
    return await this.userRepository.userHasPassword(id);
  }

  async getAllUsers(getUsersDto: GetUsersDto): Promise<PaginationType<User>> {
    return await this.userRepository.getAllUsers(getUsersDto);
  }

  async changeStatus(id: number): Promise<User> {
    const currentUser = await this.findOneById(id);
    return await this.userRepository.changeStatus(id, currentUser!.status);
  }

  async getCitedUsers(): Promise<CitedUser[]> {
    return await this.userRepository.getCitedUsers();
  }

  async validateCitedUsersExist(userIds: number[]): Promise<void> {
    return await this.userRepository.validateCitedUsersExist(userIds);
  }

  async updatePassword(id: number, hashedPassword: string): Promise<User> {
    return await this.userRepository.updatePassword(id, hashedPassword);
  }
}
