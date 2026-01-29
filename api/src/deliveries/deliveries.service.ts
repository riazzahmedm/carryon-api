import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { RiskService } from "src/risk/risk.service";

@Injectable()
export class DeliveriesService {
  constructor(private prisma: PrismaService, private riskService: RiskService) { }

  create(senderId: string, dto: CreateDeliveryDto) {
    return this.prisma.delivery.create({
      data: {
        senderId,
        itemName: dto.itemName,
        itemCategory: dto.itemCategory,
        weightKg: dto.weightKg,
        declaredValue: dto.declaredValue,
        fromCity: dto.fromCity,
        toCity: dto.toCity,
        travelDate: new Date(dto.travelDate),
      },
    });
  }

  myDeliveries(senderId: string) {
    return this.prisma.delivery.findMany({
      where: { senderId },
      orderBy: { createdAt: "desc" },
    });
  }

  async matchDelivery(deliveryId: string, tripId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    const risk = await this.riskService.evaluate(deliveryId, tripId);

    if (risk.decision === "BLOCK") {
      throw new BadRequestException("Match blocked by risk engine");
    }

    if (!delivery || !trip) {
      throw new BadRequestException("Invalid delivery or trip");
    }

    if (delivery.senderId === trip.userId) {
      throw new BadRequestException(
        "You cannot match delivery to your own trip",
      );
    }

    if (delivery.status !== "CREATED") {
      throw new BadRequestException("Delivery not matchable");
    }

    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        tripId,
        status: "MATCHED",
      },
    });
  }

  async approve(deliveryId: string, travellerId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { trip: true },
    });

    if (!delivery || delivery.status !== "MATCHED") {
      throw new BadRequestException("Invalid delivery state");
    }

    if (delivery?.trip?.userId !== travellerId) {
      throw new BadRequestException("Not authorized");
    }

    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: { status: "APPROVED" },
    });
  }

  async reject(deliveryId: string, travellerId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { trip: true },
    });

    if (!delivery || delivery.status !== "MATCHED") {
      throw new BadRequestException("Invalid delivery state");
    }

    if (delivery?.trip?.userId !== travellerId) {
      throw new BadRequestException("Not authorized");
    }

    return this.prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        status: "REJECTED",
        tripId: null,
      },
    });
  }

  async pickup(deliveryId: string) {
    return this.updateStatus(deliveryId, "APPROVED", "PICKED_UP");
  }

  async confirm(deliveryId: string) {
    return this.updateStatus(deliveryId, "PICKED_UP", "DELIVERED");
  }

  private async updateStatus(
    id: string,
    from: any,
    to: any,
  ) {
    const delivery = await this.prisma.delivery.findUnique({ where: { id } });

    if (!delivery || delivery.status !== from) {
      throw new BadRequestException("Invalid delivery state");
    }

    return this.prisma.delivery.update({
      where: { id },
      data: { status: to },
    });
  }
}
