import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DeliveryCategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.deliveryCategory.findMany({
      where: { isActive: true },
      select: {
        id: true,
        label: true,
      },
      orderBy: { label: "asc" },
    });
  }
}
