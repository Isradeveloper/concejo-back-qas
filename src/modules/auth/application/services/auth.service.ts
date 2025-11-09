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
import { MailTemplate } from 'src/modules/common/infrastructure/utils/mail-templates.util';

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
      htmlBody: new MailTemplate(
        'Código de verificación',
        `<div style="text-align: center;"><span style="font-size: 15px;">Hola ${user.firstName} ${user.lastName} 👋, te compartimos tu código de verificación: </span> <br/> <br/> <span style="font-size: 25px; font-weight: bold;">${saveCode.code}</span></div>`,
      ).render(),
    });

    return { ...userUpdated, token: this.tokenService.generateAccessToken(userUpdated.id) };
  }

  async resendVerificationCode(email: string): Promise<MessageResponseClass> {
    const user = await this.usersService.findOneByEmail(email);
    const saveCode = this.codeService.generateSaveCode('isVerification');
    await this.codeService.saveCode(user.id, saveCode);
    await this.mailerService.sendEmail({
      to: email,
      subject: 'Código de verificación',
      htmlBody: new MailTemplate(
        'Código de verificación',
        `<div style="text-align: center;"><span style="font-size: 15px;">Hola ${user.firstName} ${user.lastName} 👋, te compartimos tu código de verificación: </span> <br/> <br/> <span style="font-size: 25px; font-weight: bold;">${saveCode.code}</span></div>`,
      ).render(),
    });
    return { message: 'Código de verificación enviado' };
  }

  async verifyEmail(verifyEmailDto: VerifyCodeDto): Promise<MessageResponseWithToken> {
    const user = await this.usersService.findOneByEmail(verifyEmailDto.email);

    await this.codeService.verifyCode(user.id, verifyEmailDto.code);

    await this.mailerService.sendEmail({
      to: verifyEmailDto.email,
      subject: 'Email verificado correctamente',
      htmlBody: new MailTemplate(
        'Email verificado correctamente',
        `<div style="text-align: center;"><span style="font-size: 15px;">Hola ${user.firstName} ${user.lastName} 👋, tu email ha sido verificado correctamente</span></div>`,
      ).render(),
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
      htmlBody: new MailTemplate(
        'Código de inicio de sesión',
        `<div style="text-align: center;"><span style="font-size: 15px;">Hola ${user.firstName} ${user.lastName} 👋, te compartimos tu código de inicio de sesión: </span> <br/> <br/> <span style="font-size: 25px; font-weight: bold;">${saveCode.code}</span></div>`,
      ).render(),
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

  async generatePasswordRecoveryCode(email: string): Promise<MessageResponseClass> {
    const user = await this.usersService.findOneByEmail(email);

    const hasPassword = await this.usersService.userHasPassword(user.id);
    if (!hasPassword) {
      throw new BadRequestException('Este usuario no tiene contraseña configurada');
    }

    const saveCode = this.codeService.generateSaveCode('isPasswordRecovery');

    await this.codeService.saveCode(user.id, saveCode);

    await this.mailerService.sendEmail({
      to: email,
      subject: 'Código de recuperación de contraseña',
      htmlBody: new MailTemplate(
        'Código de recuperación de contraseña',
        `<div style="text-align: center;"><span style="font-size: 15px;">Hola ${user.firstName} ${user.lastName} 👋, te compartimos tu código de recuperación de contraseña: </span> <br/> <br/> <span style="font-size: 25px; font-weight: bold;">${saveCode.code}</span></div>`,
      ).render(),
    });

    return { message: 'Código de recuperación de contraseña enviado' };
  }

  async verifyPasswordRecoveryCode(email: string, code: string): Promise<MessageResponseClass> {
    const user = await this.usersService.findOneByEmail(email);

    await this.codeService.verifyPasswordRecoveryCode(user.id, code);

    return { message: 'Código de recuperación de contraseña verificado correctamente' };
  }

  async changePassword(email: string, code: string, newPassword: string): Promise<MessageResponseClass> {
    const user = await this.usersService.findOneByEmail(email);

    await this.codeService.markPasswordRecoveryCodeAsUsed(user.id, code);

    const hashedPassword: string = await bcrypt.hash(newPassword, 10);

    await this.usersService.updatePassword(user.id, hashedPassword);

    await this.mailerService.sendEmail({
      to: email,
      subject: 'Contraseña cambiada exitosamente',
      htmlBody: new MailTemplate(
        'Contraseña cambiada exitosamente',
        `<div style="text-align: center;"><span style="font-size: 15px;">Hola ${user.firstName} ${user.lastName} 👋, tu contraseña ha sido cambiada exitosamente. Si no realizaste este cambio, por favor contacta con soporte.</span></div>`,
      ).render(),
    });

    return { message: 'Contraseña cambiada exitosamente' };
  }
}
