import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { PricingService } from "src/pricing/pricing.service";

type DeliveryStatus = {
  status: string;
};

@Injectable()
export class TripsService {
  constructor(
    private prisma: PrismaService,
    private pricingService: PricingService,
  ) { }

  private computeTripStatus(deliveries: DeliveryStatus[]) {
    if (!deliveries || deliveries.length === 0) {
      return "AVAILABLE";
    }

    if (deliveries.some(d => d.status === "PICKED_UP")) {
      return "IN_TRANSIT";
    }

    if (deliveries.some(d => d.status === "APPROVED" || d.status === "MATCHED")) {
      return "MATCHED";
    }

    if (
      deliveries.every(
        d => d.status === "DELIVERED" || d.status === "CLOSED"
      )
    ) {
      return "COMPLETED";
    }
    return "AVAILABLE";
  }


  createTrip(userId: string, dto: CreateTripDto) {
    return this.prisma.trip.create({
      data: {
        userId,
        fromCity: dto.fromCity,
        toCity: dto.toCity,
        flightDate: new Date(dto.flightDate),
        capacityKg: dto.capacityKg,
      },
    });
  }

  async getMyTrips(userId: string) {
    const trips = await this.prisma.trip.findMany({
      where: { userId, isActive: true },
      include: {
        deliveries: {
          include: {
            sender: {
              select: {
                id: true,
                fullName: true
              },
            },
          },
        },
      },
      orderBy: { flightDate: "asc" },
    });


    const enrichedTrips = await Promise.all(
      trips.map(async (trip) => {
        const deliveriesWithEarning = await Promise.all(
          trip.deliveries.map(async (delivery) => {
            const earning = delivery.travellerEarning !== null
              ? delivery.travellerEarning
              : await this.pricingService.travellerEarning(delivery.id, trip.id);
            return { ...delivery, travellerEarning: earning };
          })
        );

        return {
          ...trip,
          deliveries: deliveriesWithEarning,
          tripStatus: this.computeTripStatus(deliveriesWithEarning),
        };
      })
    );

    return enrichedTrips;
  }

  searchTrips(
    currentUserId: string,
    fromCity: string,
    toCity: string,
    date: string,
  ) {
    if (!fromCity || !toCity) {
      throw new BadRequestException("Invalid route filters");
    }
    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.prisma.trip.findMany({
      where: {
        fromCity,
        toCity,
        isActive: true,
        userId: { not: currentUserId }, // 👈 CRITICAL
        flightDate: {
          gte: start,
          lte: end,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { flightDate: "asc" },
    });
  }

  async getTravellerEarningSummary(travellerId: string) {
    const deliveries = await this.prisma.delivery.findMany({
      where: {
        trip: {
          userId: travellerId,
        },
        travellerEarning: {
          not: null,
        },
        status: {
          in: [
            "APPROVED",
            "PICKED_UP",
            "IN_TRANSIT",
            "DELIVERED"
          ],
        },
      },
      select: {
        status: true,
        travellerEarning: true,
      },
    });

    let pending = 0;
    let completed = 0;

    for (const d of deliveries) {
      if (!d.travellerEarning) continue;

      if (["DELIVERED"].includes(d.status)) {
        completed += d.travellerEarning;
      } else {
        pending += d.travellerEarning;
      }
    }
    
    return {
      pending,
      completed,
    };
  }

}
