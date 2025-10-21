import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../../domain/interfaces/jwt-auth-payload';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { envVars } from 'src/config/envs';
import { User } from 'src/modules/users/domain/entities/user.entity';
import { UsersService } from 'src/modules/users/application/services/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      secretOrKey: envVars.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;

    const user = await this.usersService.findOneById(id, false);

    if (!user) {
      throw new UnauthorizedException('El token no es válido');
    }

    if (!user.status) {
      throw new UnauthorizedException('El usuario está inactivo, habla con un administrador');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'El correo electrónico del usuario no está verificado, por favor verifica tu correo electrónico',
      );
    }

    return user;
  }
}
