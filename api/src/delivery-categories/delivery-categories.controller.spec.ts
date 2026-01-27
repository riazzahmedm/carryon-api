import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryCategoriesController } from './delivery-categories.controller';

describe('DeliveryCategoriesController', () => {
  let controller: DeliveryCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryCategoriesController],
    }).compile();

    controller = module.get<DeliveryCategoriesController>(DeliveryCategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
