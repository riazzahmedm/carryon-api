import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TripsModule } from './trips/trips.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { RiskModule } from './risk/risk.module';
import { PricingModule } from './pricing/pricing.module';
import { PaymentsModule } from './payments/payments.module';
import { DeliveryCategoriesModule } from './delivery-categories/delivery-categories.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, TripsModule, DeliveriesModule, RiskModule, PricingModule, PaymentsModule, DeliveryCategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
