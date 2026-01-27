import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        profileDone: true,
        createdAt: true,
      },
    });
  }

  async signup(userId: string, data: { fullName: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (user.profileDone) {
      throw new BadRequestException("Profile already completed");
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email,
        profileDone: true,
        status: "ACTIVE",
      },
      select: {
        id: true,
        phone: true,
        fullName: true,
        email: true,
        profileDone: true,
      },
    });
  }

  updateProfile(userId: string, data: Partial<{ fullName: string; email: string }>) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
