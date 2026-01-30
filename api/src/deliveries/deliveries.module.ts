import { Module } from '@nestjs/common';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import { RiskModule } from 'src/risk/risk.module';
import { PricingModule } from 'src/pricing/pricing.module';

@Module({
  imports: [RiskModule, PricingModule],
  controllers: [DeliveriesController],
  providers: [DeliveriesService]
})
export class DeliveriesModule {}
