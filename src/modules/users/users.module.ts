import { forwardRef, Module } from '@nestjs/common';
import { UsersController } from './infrastructure/controllers/users.controller';
import { UsersService } from './application/services/user.service';
import { UserTypeService } from './application/services/user-type.service';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { UserTypeRepository } from './infrastructure/repositories/user-type.repository';
import { UserTypesController } from './infrastructure/controllers/user-types.controller';
import { DocumentTypeRepository } from './infrastructure/repositories/document-type.repository';
import { DependencyRepository } from './infrastructure/repositories/dependency.repository';
import { DocumentTypeService } from './application/services/document-type.service';
import { DocumentTypesController } from './infrastructure/controllers/document-types.controller';
import { AuthModule } from '../auth/auth.module';
import { DependencyService } from './application/services/dependency.service';
import { DependenciesController } from './infrastructure/controllers/dependency.controller';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [UsersController, UserTypesController, DocumentTypesController, DependenciesController],
  providers: [
    UsersService,
    UserRepository,
    UserTypeRepository,
    UserTypeService,
    DocumentTypeRepository,
    DocumentTypeService,
    DependencyRepository,
    DependencyService,
  ],
  exports: [UsersService, UserTypeService, DocumentTypeService],
})
export class UsersModule {}
