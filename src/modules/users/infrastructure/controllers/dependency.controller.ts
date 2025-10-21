import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DependencyService } from '../../application/services/dependency.service';
import { UserDependency } from '../../domain/entities/user-dependency.entity';

@UseGuards(AuthGuard())
@ApiBearerAuth()
@ApiTags('dependencies')
@Controller('dependencies')
export class DependenciesController {
  constructor(private readonly dependencyService: DependencyService) {}

  @Get()
  @ApiOkResponse({ type: UserDependency, isArray: true })
  findAll(): Promise<UserDependency[]> {
    return this.dependencyService.getAll();
  }
}
