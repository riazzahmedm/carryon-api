import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RiskService } from "./risk.service";
import { EvaluateRiskDto } from "./dto/evaluate-risk.dto";

@ApiTags("Risk")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("risk")
export class RiskController {
  constructor(private risk: RiskService) {}

  @Post("evaluate")
  @ApiOperation({ summary: "Evaluate risk for delivery-trip match" })
  evaluate(@Body() dto: EvaluateRiskDto) {
    return this.risk.evaluate(dto.deliveryId, dto.tripId);
  }
}
