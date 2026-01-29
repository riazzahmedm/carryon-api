import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller';
import { TripsService } from './trips.service';
import { PricingModule } from 'src/pricing/pricing.module';

@Module({
  imports: [PricingModule],
  controllers: [TripsController],
  providers: [TripsService]
})
export class TripsModule {}
