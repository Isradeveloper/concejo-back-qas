export interface JwtPayload {
  id: number;
}

export interface RefreshTokenPayload {
  id: number;
  type: 'refresh';
}
