import { Module } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CommonModule } from './modules/common/common.module';
import { ParticipationMechanismsModule } from './modules/participation-mechanisms/participation-mechanisms.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, CommonModule, ParticipationMechanismsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
