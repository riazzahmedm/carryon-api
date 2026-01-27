import { Module } from "@nestjs/common";
import { DeliveryCategoriesService } from "./delivery-categories.service";
import { DeliveryCategoriesController } from "./delivery-categories.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [DeliveryCategoriesService],
  controllers: [DeliveryCategoriesController],
})
export class DeliveryCategoriesModule {}
