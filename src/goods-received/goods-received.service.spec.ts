import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivedService } from './goods-received.service';

describe('GoodsReceivedService', () => {
  let service: GoodsReceivedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GoodsReceivedService],
    }).compile();

    service = module.get<GoodsReceivedService>(GoodsReceivedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
