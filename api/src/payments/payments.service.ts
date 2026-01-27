import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { PricingService } from "../pricing/pricing.service";

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private pricing: PricingService,
  ) {}

  async initiate(deliveryId: string, tripId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery || delivery.status !== "MATCHED") {
      throw new BadRequestException("Delivery not ready for payment");
    }

    // --- Get price quote ---
    const quote = await this.pricing.quote(deliveryId, tripId);

    // --- Create escrow payment ---
    return this.prisma.payment.create({
      data: {
        deliveryId,
        amount: quote.total,
        platformFee: quote.platformFee,
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
