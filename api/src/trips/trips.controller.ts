import { Controller, Get, Post, Body, UseGuards, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { TripsService } from "./trips.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateTripDto } from "./dto/create-trip.dto";

@ApiTags("Trips")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("trips")
export class TripsController {
  constructor(private tripsService: TripsService) { }

  @Post()
  @ApiOperation({ summary: "Create a new trip (Traveller flow)" })
  createTrip(
    @CurrentUser() user: any,
    @Body() dto: CreateTripDto,
  ) {
    return this.tripsService.createTrip(user.userId, dto);
  }

  @Get("my")
  @ApiOperation({ summary: "Get my trips" })
  getMyTrips(@CurrentUser() user: any) {
    return this.tripsService.getMyTrips(user.userId);
  }

  @Get("search")
  @ApiOperation({ summary: "Search available trips (Sender flow)" })
  search(
    @CurrentUser() user: any,
    @Query("from") from: string,
    @Query("to") to: string,
    @Query("date") date: string,
  ) {
    return this.tripsService.searchTrips(
      user.userId,
      from,
      to,
      date,
    );
  }
}
