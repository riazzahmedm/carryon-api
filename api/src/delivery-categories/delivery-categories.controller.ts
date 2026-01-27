import { Controller, Get } from "@nestjs/common";
import { DeliveryCategoriesService } from "./delivery-categories.service";

@Controller("delivery-categories")
export class DeliveryCategoriesController {
  constructor(
    private readonly service: DeliveryCategoriesService
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }
}
