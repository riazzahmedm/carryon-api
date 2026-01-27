import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PaymentsService } from "./payments.service";
import { InitiatePaymentDto } from "./dto/initiate-payment.dto";

@ApiTags("Payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post("initiate")
  @ApiOperation({ summary: "Initiate escrow payment" })
  initiate(@Body() dto: InitiatePaymentDto) {
    return this.payments.initiate(dto.deliveryId, dto.tripId);
  }

  @Post(":id/capture")
  @ApiOperation({ summary: "Capture payment (internal)" })
  capture(@Param("id") id: string) {
    return this.payments.capture(id);
  }

  @Post(":id/release")
  @ApiOperation({ summary: "Release escrow to traveller" })
  release(@Param("id") id: string) {
    return this.payments.release(id);
  }

  @Post(":id/refund")
  @ApiOperation({ summary: "Refund escrow to sender" })
  refund(@Param("id") id: string) {
    return this.payments.refund(id);
  }
}
