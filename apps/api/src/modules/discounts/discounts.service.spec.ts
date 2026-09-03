import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { DiscountStatus, DiscountType } from './schemas/discount.schema';

describe('DiscountsService.applyCode', () => {
  let model: { findOne: jest.Mock; updateOne: jest.Mock };
  let service: DiscountsService;

  function mockDiscount(overrides: Record<string, unknown> = {}) {
    return {
      _id: 'discount-1',
      code: 'SAVE10',
      type: DiscountType.PERCENTAGE,
      value: 10,
      minSubtotal: null,
      maxDiscount: null,
      usageLimit: null,
      usageCount: 0,
      startsAt: null,
      endsAt: null,
      status: DiscountStatus.ACTIVE,
      ...overrides,
    };
  }

  beforeEach(() => {
    model = { findOne: jest.fn(), updateOne: jest.fn().mockReturnValue({ exec: jest.fn() }) };
    service = new DiscountsService(model as any);
  });

  it('throws when the code does not exist', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(service.applyCode('store-1', 'MISSING', 100)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when the discount is not active', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDiscount({ status: DiscountStatus.DISABLED })),
    });

    await expect(service.applyCode('store-1', 'SAVE10', 100)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the subtotal is below the minimum', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockDiscount({ minSubtotal: 50 })) });

    await expect(service.applyCode('store-1', 'SAVE10', 20)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws once the usage limit is reached', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDiscount({ usageLimit: 5, usageCount: 5 })),
    });

    await expect(service.applyCode('store-1', 'SAVE10', 100)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('computes a percentage discount and increments usage', async () => {
    model.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(mockDiscount({ value: 10 })) });

    const result = await service.applyCode('store-1', 'SAVE10', 100);

    expect(result.amount).toBe(10);
    expect(model.updateOne).toHaveBeenCalledWith({ _id: 'discount-1' }, { $inc: { usageCount: 1 } });
  });

  it('caps a percentage discount at maxDiscount', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDiscount({ value: 50, maxDiscount: 20 })),
    });

    const result = await service.applyCode('store-1', 'SAVE10', 100);

    expect(result.amount).toBe(20);
  });

  it('caps a fixed discount at the subtotal', async () => {
    model.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDiscount({ type: DiscountType.FIXED, value: 50 })),
    });

    const result = await service.applyCode('store-1', 'SAVE10', 30);

    expect(result.amount).toBe(30);
  });
});
