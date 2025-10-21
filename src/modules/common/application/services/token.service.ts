import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ACCESS_TOKEN_EXPIRATION_TIME,
  REFRESH_TOKEN_EXPIRATION_TIME,
} from 'src/modules/auth/domain/constants/jwt-constants';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateRefreshToken(userId: number): string {
    const refreshToken = this.jwtService.sign(
      { id: userId, type: 'refresh' },
      { expiresIn: REFRESH_TOKEN_EXPIRATION_TIME },
    );
    return refreshToken;
  }

  generateAccessToken(userId: number): string {
    return this.jwtService.sign({ id: userId }, { expiresIn: ACCESS_TOKEN_EXPIRATION_TIME });
  }
}
