import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { DeliveriesService } from "./deliveries.service";
import { CreateDeliveryDto } from "./dto/create-delivery.dto";
import { MatchDeliveryDto } from "./dto/match-delivery.dto";

@ApiTags("Deliveries")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("deliveries")
export class DeliveriesController {
  constructor(private deliveries: DeliveriesService) { }

  @Post()
  @ApiOperation({ summary: "Create delivery (Sender flow)" })
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateDeliveryDto,
  ) {
    return this.deliveries.create(user.userId, dto);
  }

  @Get("my")
  @ApiOperation({ summary: "Get my deliveries" })
  my(@CurrentUser() user: any) {
    return this.deliveries.myDeliveries(user.userId);
  }

  @Post(":id/match")
  @ApiOperation({ summary: "Match delivery to a trip" })
  match(
    @Param("id") id: string,
    @Body() dto: MatchDeliveryDto,
  ) {
    return this.deliveries.matchDelivery(id, dto.tripId);
  }

  @Post(":id/approve")
  @ApiOperation({ summary: "Traveller approves delivery" })
  approve(
    @CurrentUser() user: any,
    @Param("id") id: string,
  ) {
    return this.deliveries.approve(id, user.userId);
  }

  @Post(":id/reject")
  @ApiOperation({ summary: "Traveller rejects delivery" })
  reject(
    @CurrentUser() user: any,
    @Param("id") id: string,
  ) {
    return this.deliveries.reject(id, user.userId);
  }

  @Post(":id/pickup")
  @ApiOperation({ summary: "Mark delivery as picked up" })
  pickup(@Param("id") id: string) {
    return this.deliveries.pickup(id);
  }

  @Post(":id/confirm")
  @ApiOperation({ summary: "Confirm delivery" })
  confirm(@Param("id") id: string) {
    return this.deliveries.confirm(id);
  }
}
