import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class RiskService {
  constructor(private prisma: PrismaService) {}

  async evaluate(deliveryId: string, tripId: string) {
    const delivery = await this.prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: { sender: true },
    });

    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { user: true },
    });

    if (!delivery || !trip) {
      return { decision: "BLOCK", reason: "Invalid delivery or trip" };
    }

    let score = 0;
    const reasons: string[] = [];

    // --- Sender checks ---
    if (!delivery.sender.profileDone) {
      score += 30;
      reasons.push("Sender profile incomplete");
    }

    if (delivery.sender.status !== "ACTIVE") {
      score += 40;
      reasons.push("Sender not active");
    }

    // --- Traveller checks ---
    if (!trip.user.profileDone) {
      score += 20;
      reasons.push("Traveller profile incomplete");
    }

    // --- Delivery checks ---
    if (delivery.declaredValue > 10000) {
      return { decision: "BLOCK", reason: "Declared value too high" };
    }

    if (delivery.weightKg > 5) {
      return { decision: "BLOCK", reason: "Item too heavy" };
    }

    // --- Trip checks ---
    const hoursToFlight =
      (trip.flightDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursToFlight < 12) {
      score += 20;
      reasons.push("Trip too soon");
    }

    if (trip.capacityKg < delivery.weightKg) {
      return { decision: "BLOCK", reason: "Insufficient trip capacity" };
    }

    // --- Final decision ---
    let decision: "ALLOW" | "REVIEW" | "HIGH" | "BLOCK";

    if (score >= 80) decision = "BLOCK";
    else if (score >= 60) decision = "HIGH";
    else if (score >= 30) decision = "REVIEW";
    else decision = "ALLOW";

    return {
      score,
      decision,
      reasons,
    };
  }
}
