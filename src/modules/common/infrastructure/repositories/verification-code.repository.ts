import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/application/services/prisma.service';
import { VerificationCode } from '../../domain/entities/verification-code.entity';
import { SaveCode } from '../../domain/interfaces/save-code.interface';

@Injectable()
export class VerificationCodeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async verifyCode(userId: number, code: string): Promise<VerificationCode> {
    const verificationCode = await this.prisma.verificationCode.findFirst({ where: { code, userId } });
    if (!verificationCode) throw new NotFoundException(`No se encontró el código de verificación ${code}`);

    if (verificationCode.used) throw new BadRequestException(`El código de verificación ya ha sido usado`);
    if (verificationCode.expiresAt < new Date()) throw new BadRequestException(`El código de verificación ha expirado`);

    if (verificationCode.isVerification) {
      return await this.prisma.verificationCode
        .update({
          where: { id: verificationCode.id },
          data: {
            used: true,
            user: {
              update: {
                emailVerified: true,
              },
            },
          },
        })
        .then((verificationCode) => VerificationCode.fromPrisma(verificationCode));
    }

    return await this.prisma.verificationCode
      .update({ where: { id: verificationCode.id }, data: { used: true } })
      .then((verificationCode) => VerificationCode.fromPrisma(verificationCode));
  }

  async saveCode(userId: number, saveCode: SaveCode): Promise<VerificationCode> {
    return await this.prisma.verificationCode
      .create({
        data: {
          userId,
          ...saveCode,
        },
      })
      .then((verificationCode) => VerificationCode.fromPrisma(verificationCode));
  }
}
