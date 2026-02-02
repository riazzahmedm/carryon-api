import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RiskService } from "../risk/risk.service";

@Injectable()
export class PricingService {
  constructor(
    private prisma: PrismaService,
    private riskService: RiskService,
  ) { }

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

    const risk = await this.riskService.evaluate(deliveryId, tripId);

    if (risk.decision === "BLOCK") {
      throw new BadRequestException("Pricing blocked due to high risk");
    }

    // ---------- BASE ----------
    const BASE_PRICE = 200;
    const COST_PER_KG = 100;

    const base = BASE_PRICE;
    const weightCost = delivery.weightKg * COST_PER_KG;
    const baseSubtotal = base + weightCost;

    // ---------- DISTANCE ----------
    const routeKey = `${trip.fromCity}-${trip.toCity}`;
    const distanceMultiplier =
      routeKey === "HYD-BLR" ? 1.1 :
        routeKey === "BLR-HYD" ? 1.2 :
          routeKey === "HYD-MAA" ? 1.5 :
            routeKey === "MAA-HYD" ? 1.6 :
              1.0;

    const distanceFee = Math.round(
      baseSubtotal * (distanceMultiplier - 1)
    );

    const afterDistance = baseSubtotal + distanceFee;

    // ---------- URGENCY ----------
    const daysToFlight = Math.ceil(
      (trip.flightDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    let urgencyMultiplier = 1;
    if (daysToFlight <= 1) urgencyMultiplier = 1.6;
    else if (daysToFlight === 2) urgencyMultiplier = 1.3;
    else if (daysToFlight <= 4) urgencyMultiplier = 1.1;

    const urgencyFee = Math.round(
      afterDistance * (urgencyMultiplier - 1)
    );

    const afterUrgency = afterDistance + urgencyFee;

    // ---------- RISK ----------
    let riskMultiplier = 1;
    if (risk.decision === "REVIEW") riskMultiplier = 1.2;
    if (risk.decision === "HIGH") riskMultiplier = 1.5;

    const riskFee = Math.round(
      afterUrgency * (riskMultiplier - 1)
    );

    const travellerEarning = afterUrgency + riskFee;

    // ---------- PLATFORM ----------
    const platformFee = Math.round(travellerEarning * 0.1);
    const total = travellerEarning + platformFee;

    return {
      breakdown: {
        base,
        weightCost,
        distanceFee,
        urgencyFee,
        riskFee,
      },
      risk: risk.decision,
      travellerEarning,
      platformFee,
      total,
    };
  }

  async travellerEarning(deliveryId: string, tripId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
    });

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!delivery || !trip) return null;

    // --- base calc (same as quote) ---
    const BASE_PRICE = 200;
    const COST_PER_KG = 100;

    let price = BASE_PRICE + delivery.weightKg * COST_PER_KG;

    const routeKey = `${trip.fromCity}-${trip.toCity}`;
    const distanceMultiplier =
      routeKey === "HYD-BLR" ? 1.1 :
        routeKey === "BLR-HYD" ? 1.2 :
          routeKey === "HYD-CHN" ? 1.5 :
            routeKey === "CHN-HYD" ? 1.6 :
              1.0;

    price *= distanceMultiplier;

    const hoursToFlight =
      (trip.flightDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursToFlight < 12) price *= 1.6;
    else if (hoursToFlight < 24) price *= 1.3;
    else if (hoursToFlight < 48) price *= 1.1;

    // 👇 Traveller earns BEFORE platform fee
    return Math.round(price);
  }
}
