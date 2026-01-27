import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PricingService } from "./pricing.service";
import { PriceQuoteDto } from "./dto/price-quote.dto";

@ApiTags("Pricing")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("pricing")
export class PricingController {
  constructor(private pricing: PricingService) {}

  @Post("quote")
  @ApiOperation({ summary: "Get price quote for delivery-trip match" })
  quote(@Body() dto: PriceQuoteDto) {
    return this.pricing.quote(dto.deliveryId, dto.tripId);
  }
}
