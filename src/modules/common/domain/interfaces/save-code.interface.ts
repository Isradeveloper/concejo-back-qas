export interface SaveCode {
  code: string;
  createdAt: Date;
  expiresAt: Date;
  isLogin?: boolean;
  isVerification?: boolean;
  isPasswordRecovery?: boolean;
}
