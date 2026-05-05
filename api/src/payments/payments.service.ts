import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initiate(deliveryId: string, tripId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery || delivery.status !== "APPROVED") {
      throw new BadRequestException("Delivery not ready for payment");
    }

    if (!delivery.agreedPrice || !delivery.platformFee) {
      throw new BadRequestException("Delivery pricing not finalised");
    }

    return this.prisma.payment.create({
      data: {
        deliveryId,
        amount: delivery.agreedPrice,
        platformFee: delivery.platformFee,
        provider: "MOCK",
        status: "AUTHORIZED",
      },
    });
  }

  async capture(paymentId: string) {
    return this.transition(paymentId, "AUTHORIZED", "CAPTURED");
  }

  async release(paymentId: string) {
    return this.transition(paymentId, "CAPTURED", "RELEASED");
  }

  async refund(paymentId: string) {
    return this.transition(paymentId, "CAPTURED", "REFUNDED");
  }

  private async transition(
    id: string,
    from: any,
    to: any,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment || payment.status !== from) {
      throw new BadRequestException("Invalid payment state");
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: to },
    });
  }
}
