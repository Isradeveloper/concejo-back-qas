import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../../application/services/auth.service';
import { VerifyCodeDto } from '../../application/dto/verify-code.dto';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { UserWithToken } from '../../../users/domain/entities/user.entity';
import {
  MessageResponseClass,
  MessageResponseWithTokenClass,
} from 'src/modules/common/domain/interfaces/messages-responses.interface';
import { RefreshTokenDto } from '../../application/dto/refresh-token.dto';
import { LogoutDto } from '../../application/dto/logout.dto';
import { LoginWithPasswordDto } from '../../application/dto/login-with-password.dto';
import { CreateCitizenUserDto } from 'src/modules/users/application/dto/create-citizen-user.dto';
import { GenerateLoginCodeDto } from '../../application/dto/generate-login-code.dto';
import { ResendVerificationCodeDto } from '../../application/dto/resend-verification-code.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register-citizen')
  @ApiOkResponse({ type: UserWithToken })
  registerCitizen(@Body() createCitizenUserDto: CreateCitizenUserDto) {
    return this.authService.registerCitizen(createCitizenUserDto);
  }

  @Post('verify-email')
  @ApiOkResponse({ type: MessageResponseWithTokenClass })
  verifyEmail(@Body() verifyEmailDto: VerifyCodeDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('refresh-token')
  @ApiOkResponse({ type: UserWithToken })
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  @ApiOkResponse({ type: MessageResponseClass })
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto.userId);
  }

  @Post('login-with-password')
  @ApiOkResponse({ type: UserWithToken })
  loginWithPassword(@Body() loginWithPasswordDto: LoginWithPasswordDto) {
    return this.authService.loginWithPassword(loginWithPasswordDto);
  }

  @Post('generate-login-code')
  @ApiOkResponse({ type: MessageResponseClass })
  generateLoginCode(@Body() generateLoginCodeDto: GenerateLoginCodeDto) {
    return this.authService.generateLoginCode(generateLoginCodeDto.email);
  }

  @Post('verify-login-code')
  @ApiOkResponse({ type: UserWithToken })
  verifyLoginCode(@Body() verifyLoginCodeDto: VerifyCodeDto) {
    return this.authService.verifyLoginCode({ ...verifyLoginCodeDto });
  }

  @Post('resend-verification-code')
  @ApiOkResponse({ type: MessageResponseClass })
  resendVerificationCode(@Body() resendVerificationCodeDto: ResendVerificationCodeDto) {
    return this.authService.resendVerificationCode(resendVerificationCodeDto.email);
  }
}
