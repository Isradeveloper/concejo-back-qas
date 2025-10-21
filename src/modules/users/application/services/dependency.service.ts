import { Injectable } from '@nestjs/common';
import { DependencyRepository } from '../../infrastructure/repositories/dependency.repository';
import { UserDependency } from '../../domain/entities/user-dependency.entity';

@Injectable()
export class DependencyService {
  constructor(private readonly dependencyRepository: DependencyRepository) {}

  async getAll(): Promise<UserDependency[]> {
    return await this.dependencyRepository.getAll();
  }

  async findOneById(id: number): Promise<UserDependency> {
    return await this.dependencyRepository.findOneById(id);
  }
}
