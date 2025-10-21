import { forwardRef, Global, Module } from '@nestjs/common';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './infrastructure/strategies/jwt-strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envVars } from 'src/config/envs';
import { ACCESS_TOKEN_EXPIRATION_TIME } from './domain/constants/jwt-constants';

@Global()
@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: envVars.JWT_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule, JwtModule, JwtStrategy, AuthService],
})
export class AuthModule {}
