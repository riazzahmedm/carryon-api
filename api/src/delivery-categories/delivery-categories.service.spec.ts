import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryCategoriesService } from './delivery-categories.service';

describe('DeliveryCategoriesService', () => {
  let service: DeliveryCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryCategoriesService],
    }).compile();

    service = module.get<DeliveryCategoriesService>(DeliveryCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
