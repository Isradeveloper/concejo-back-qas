import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../../users/application/services/user.service';
import { UserWithToken } from '../../../users/domain/entities/user.entity';
import { UserTypeService } from 'src/modules/users/application/services/user-type.service';
import { DocumentTypeService } from 'src/modules/users/application/services/document-type.service';
import { CodeService } from 'src/modules/common/application/services/code.service';
import { MailerService } from 'src/modules/common/application/services/mailer.service';
import { JwtService } from '@nestjs/jwt';
import {
  MessageResponseClass,
  MessageResponseWithToken,
} from 'src/modules/common/domain/interfaces/messages-responses.interface';
import { VerifyCodeDto } from '../dto/verify-code.dto';
import bcrypt from 'bcrypt';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { RefreshTokenPayload } from '../../domain/interfaces/jwt-auth-payload';
import { LoginWithPasswordDto } from '../dto/login-with-password.dto';
import { CreateCitizenUserDto } from 'src/modules/users/application/dto/create-citizen-user.dto';
import { TokenService } from 'src/modules/common/application/services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly userTypeService: UserTypeService,
    private readonly documentTypeService: DocumentTypeService,
    private readonly codeService: CodeService,
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async registerCitizen(createCitizenUserDto: CreateCitizenUserDto): Promise<UserWithToken> {
    const userType = await this.userTypeService.findOneByName('Ciudadano');
    await this.documentTypeService.findOneById(createCitizenUserDto.documentTypeId);

    const saveCode = this.codeService.generateSaveCode('isVerification');

    const user = await this.usersService.createCitizen({
      createCitizenUserDto,
      userTypeId: userType.id,
      saveCode,
    });

    const userUpdated = await this.usersService.update(user.id, {
      refreshToken: this.tokenService.generateRefreshToken(user.id),
    });

    await this.mailerService.sendEmail({
      to: userUpdated.email,
      subject: 'Código de verificación',
      htmlBody: `Tu código de verificación es: ${saveCode.code}`,
    });

    return { ...userUpdated, token: this.tokenService.generateAccessToken(userUpdated.id) };
  }

  async resendVerificationCode(email: string): Promise<MessageResponseClass> {
    const user = await this.usersService.findOneByEmail(email);
    const saveCode = this.codeService.generateSaveCode('isVerification');
    await this.codeService.saveCode(user.id, saveCode);
    await this.mailerService.sendEmail({
      to: user.email,
      subject: 'Código de verificación',
      htmlBody: `Tu código de verificación es: ${saveCode.code}`,
    });
    return { message: 'Código de verificación enviado' };
  }

  async verifyEmail(verifyEmailDto: VerifyCodeDto): Promise<MessageResponseWithToken> {
    const user = await this.usersService.findOneByEmail(verifyEmailDto.email);

    await this.codeService.verifyCode(user.id, verifyEmailDto.code);

    await this.mailerService.sendEmail({
      to: user.email,
      subject: 'Email verificado correctamente',
      htmlBody: 'Tu email ha sido verificado correctamente',
    });

    return { message: 'Email verificado correctamente', token: this.jwtService.sign({ id: user.id }) };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<UserWithToken> {
    const { userId, refreshToken } = refreshTokenDto;

    const user = await this.usersService.findOneById(userId);

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Refresh token no válido');
    }

    const payload = this.jwtService.verify<RefreshTokenPayload>(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Refresh token no válido');
    }

    const updatedUser = await this.usersService.update(user.id, {
      refreshToken: this.tokenService.generateRefreshToken(user.id),
    });

    return {
      ...updatedUser,
      token: this.jwtService.sign({ id: user.id }),
    };
  }

  async logout(userId: number): Promise<MessageResponseClass> {
    await this.usersService.findOneById(userId);

    await this.usersService.update(userId, { refreshToken: '' });

    return { message: 'Has cerrado sesión correctamente' };
  }

  async loginWithPassword(loginWithPasswordDto: LoginWithPasswordDto): Promise<UserWithToken> {
    const { email, password } = loginWithPasswordDto;

    const user = await this.usersService.findOneByEmail(email);
    const userPassword = await this.usersService.getUserPassword(user.id);

    if (!userPassword) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const isMatch = await bcrypt.compare(password, userPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.emailVerified)
      throw new UnauthorizedException('Email no verificado, por favor verifique su email e intente nuevamente');

    const updatedUser = await this.usersService.update(user.id, {
      refreshToken: this.tokenService.generateRefreshToken(user.id),
    });

    return {
      ...updatedUser,
      token: this.tokenService.generateAccessToken(user.id),
    };
  }

  async generateLoginCode(email: string): Promise<MessageResponseClass> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user.userType.loginByCode) {
      throw new BadRequestException('Este tipo de usuario no puede iniciar sesión con código');
    }

    const saveCode = this.codeService.generateSaveCode('isLogin');

    await this.codeService.saveCode(user.id, saveCode);

    await this.mailerService.sendEmail({
      to: email,
      subject: 'Código de inicio de sesión',
      htmlBody: `Tu código de inicio de sesión es: ${saveCode.code}`,
    });

    return { message: 'Código de inicio de sesión enviado' };
  }

  async verifyLoginCode(verifyCodeDto: VerifyCodeDto): Promise<UserWithToken> {
    const { email, code } = verifyCodeDto;

    const user = await this.usersService.findOneByEmail(email);

    await this.codeService.verifyCode(user.id, code);

    const updatedUser = await this.usersService.update(user.id, {
      refreshToken: this.tokenService.generateRefreshToken(user.id),
    });

    return {
      ...updatedUser,
      token: this.tokenService.generateAccessToken(user.id),
    };
  }
}
