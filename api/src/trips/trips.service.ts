import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTripDto } from "./dto/create-trip.dto";

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) { }

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

  getMyTrips(userId: string) {
    return this.prisma.trip.findMany({
      where: { userId, isActive: true },
      orderBy: { flightDate: "asc" },
    });
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

}
