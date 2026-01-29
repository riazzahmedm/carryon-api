import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RiskService } from "../risk/risk.service";

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
    private riskService: RiskService,
  ) {}

  async quote(deliveryId: string, tripId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!delivery || !trip) {
      throw new BadRequestException("Invalid delivery or trip");
    }

    // --- Risk check ---
    const risk = await this.riskService.evaluate(deliveryId, tripId);

    if (risk.decision === "BLOCK") {
      throw new BadRequestException("Pricing blocked due to high risk");
    }

    // --- Base calculation ---
    const BASE_PRICE = 200;
    const COST_PER_KG = 100;

    let price = BASE_PRICE + delivery.weightKg * COST_PER_KG;

    // --- Distance multiplier ---
    const routeKey = `${trip.fromCity}-${trip.toCity}`;
    const distanceMultiplier =
      routeKey === "HYD-BLR" ? 1.1 :
      routeKey === "BLR-HYD" ? 1.2 :
      routeKey === "HYD-MAA" ? 1.5 :
      routeKey === "MAA-HYD" ? 1.6 :
      1.0;

    price *= distanceMultiplier;

    // --- Urgency multiplier ---
    const hoursToFlight =
      (trip.flightDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursToFlight < 12) price *= 1.6;
    else if (hoursToFlight < 24) price *= 1.3;
    else if (hoursToFlight < 48) price *= 1.1;

    // --- Risk multiplier ---
    if (risk.decision === "REVIEW") price *= 1.2;
    if (risk.decision === "HIGH") price *= 1.5;

    // --- Platform fee ---
    const platformFee = price * 0.1;
    const finalPrice = Math.round(price + platformFee);

    return {
      base: BASE_PRICE,
      weightCost: delivery.weightKg * COST_PER_KG,
      risk: risk.decision,
      platformFee: Math.round(platformFee),
      total: finalPrice,
    };
  }
}
