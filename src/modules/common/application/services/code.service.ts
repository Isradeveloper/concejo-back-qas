import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { VerificationCode } from '../../domain/entities/verification-code.entity';
import { VerificationCodeRepository } from '../../infrastructure/repositories/verification-code.repository';
import { MINUTES_TO_EXPIRE_VERIFICATION_CODE } from '../../domain/constants/code-expiration.constant';
import { SaveCode } from '../../domain/interfaces/save-code.interface';
import { addMinutes } from 'date-fns';

@Injectable()
export class CodeService {
  constructor(private readonly verificationCodeRepository: VerificationCodeRepository) {}
  private readonly charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  generateCode(length = 6): string {
    const bytes = crypto.randomBytes(length);
    let code = '';

    for (let i = 0; i < length; i++) {
      const index = bytes[i] % this.charset.length;
      code += this.charset[index];
    }

    return code;
  }

  async verifyCode(userId: number, code: string): Promise<VerificationCode> {
    return await this.verificationCodeRepository.verifyCode(userId, code);
  }

  async saveCode(userId: number, saveCode: SaveCode): Promise<VerificationCode> {
    return await this.verificationCodeRepository.saveCode(userId, saveCode);
  }

  generateSaveCode(key: string): SaveCode {
    return {
      code: this.generateCode(),
      createdAt: new Date(),
      expiresAt: addMinutes(new Date(), MINUTES_TO_EXPIRE_VERIFICATION_CODE),
      [key]: true,
    };
  }
}
