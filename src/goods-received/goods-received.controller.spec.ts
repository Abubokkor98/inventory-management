import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivedController } from './goods-received.controller';
import { GoodsReceivedService } from './goods-received.service';

describe('GoodsReceivedController', () => {
  let controller: GoodsReceivedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoodsReceivedController],
      providers: [GoodsReceivedService],
    }).compile();

    controller = module.get<GoodsReceivedController>(GoodsReceivedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
