import { forwardRef, Module } from '@nestjs/common';
import { ParticipationMechanismService } from './application/services/participation-mechanism.service';
import { ParticipationMechanismRepository } from './infrastructure/repositories/participation-mechanism.repository';
import { ParticipationMechanismsController } from './infrastructure/controllers/participation-mechanisms.controller';
import { HttpModule } from '@nestjs/axios';
import { RegisterRepository } from './infrastructure/repositories/register.repository';
import { RegisterService } from './application/services/register.service';
import { RegistersController } from './infrastructure/controllers/register.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [HttpModule, forwardRef(() => UsersModule), forwardRef(() => AuthModule), CommonModule],
  controllers: [ParticipationMechanismsController, RegistersController],
  providers: [ParticipationMechanismService, ParticipationMechanismRepository, RegisterRepository, RegisterService],
  exports: [ParticipationMechanismService, RegisterService],
})
export class ParticipationMechanismsModule {}
