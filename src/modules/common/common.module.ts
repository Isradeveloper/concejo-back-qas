import { Global, Module } from '@nestjs/common';
import { MailerService } from './application/services/mailer.service';
import { CodeService } from './application/services/code.service';
import { VerificationCodeRepository } from './infrastructure/repositories/verification-code.repository';
import { TokenService } from './application/services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { envVars } from 'src/config';
import { ACCESS_TOKEN_EXPIRATION_TIME } from '../auth/domain/constants/jwt-constants';
import { PaginationUtil } from './infrastructure/utils/pagination.util';

@Global()
@Module({
  imports: [
    JwtModule.register({
      secret: envVars.JWT_SECRET,
      signOptions: { expiresIn: ACCESS_TOKEN_EXPIRATION_TIME },
    }),
  ],
  providers: [MailerService, CodeService, VerificationCodeRepository, TokenService, PaginationUtil],
  exports: [MailerService, CodeService, TokenService, PaginationUtil],
})
export class CommonModule {}
