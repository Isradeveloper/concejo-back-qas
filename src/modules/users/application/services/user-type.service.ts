import { Injectable } from '@nestjs/common';
import { UserTypeRepository } from '../../infrastructure/repositories/user-type.repository';
import { UserType } from '../../domain/entities/user-type.entity';

@Injectable()
export class UserTypeService {
  constructor(private readonly userTypeRepository: UserTypeRepository) {}

  async findOneByName(name: string): Promise<UserType> {
    return await this.userTypeRepository.findOneByName(name);
  }

  async getAll(): Promise<UserType[]> {
    return await this.userTypeRepository.getAll();
  }

  async findOneById(id: number): Promise<UserType> {
    return await this.userTypeRepository.findOneById(id);
  }
}
