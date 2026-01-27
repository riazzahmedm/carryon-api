import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async requestOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await this.prisma.user.upsert({
      where: { phone },
      update: { otpCode: otp, otpExpiresAt: expiresAt },
      create: { phone, otpCode: otp, otpExpiresAt: expiresAt },
    });

    // ⚠️ MVP ONLY: log OTP instead of SMS
    console.log(`OTP for ${phone}: ${otp}`);

    return { message: "OTP sent successfully" };
  }

  async verifyOtp(phone: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (
      !user ||
      user.otpCode !== otp ||
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      throw new UnauthorizedException("Invalid or expired OTP");
    }

    await this.prisma.user.update({
      where: { phone },
      data: { otpCode: null, otpExpiresAt: null, status: "ACTIVE" },
    });

    const token = this.jwt.sign({
      sub: user.id,
      phone: user.phone,
    });

    return {
      accessToken: token,
    };
  }
}
