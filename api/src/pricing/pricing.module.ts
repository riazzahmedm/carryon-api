import { Module } from '@nestjs/common';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { RiskModule } from 'src/risk/risk.module';

@Module({
  imports: [RiskModule],
  controllers: [PricingController],
  providers: [PricingService]
})
export class PricingModule {}
