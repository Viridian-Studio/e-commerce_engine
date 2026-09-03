import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerStatus } from '@ecom/types';

/** Builds a chainable Mongoose-style query mock: `.select(...).exec()` etc. */
function queryMock(value: unknown) {
  const chain: any = {};
  chain.exec = jest.fn().mockResolvedValue(value);
  chain.select = jest.fn().mockReturnValue(chain);
  return chain;
}

describe('CustomerAuthService', () => {
  const storeId = 'store-1';

  let model: { findOne: jest.Mock; create: jest.Mock; findById: jest.Mock };
  let jwt: { sign: jest.Mock };
  let carts: { claimCart: jest.Mock };
  let service: CustomerAuthService;

  const storedCustomer = {
    _id: { toString: () => 'cust-1' },
    storeId,
    email: 'jane@example.com',
    firstName: 'Jane',
    lastName: 'Doe',
    phone: undefined,
    status: CustomerStatus.ACTIVE,
    passwordHash: '',
  };

  beforeEach(async () => {
    storedCustomer.passwordHash = await bcrypt.hash('Jane123!', 10);
    model = { findOne: jest.fn(), create: jest.fn(), findById: jest.fn() };
    jwt = { sign: jest.fn().mockReturnValue('signed.customer.token') };
    carts = { claimCart: jest.fn().mockResolvedValue(undefined) };
    service = new CustomerAuthService(model as any, jwt as any, carts as any);
  });

  describe('login', () => {
    it('returns an access token and customer payload on valid credentials', async () => {
      model.findOne.mockReturnValue(queryMock(storedCustomer));

      const res = await service.login(storeId, { email: 'jane@example.com', password: 'Jane123!' });

      expect(res.accessToken).toBe('signed.customer.token');
      expect(res.customer).toEqual({
        id: 'cust-1',
        storeId,
        email: storedCustomer.email,
        firstName: storedCustomer.firstName,
        lastName: storedCustomer.lastName,
        phone: undefined,
      });
      expect(jwt.sign).toHaveBeenCalledWith(res.customer);
    });

    it('rejects when the customer does not exist', async () => {
      model.findOne.mockReturnValue(queryMock(null));

      await expect(
        service.login(storeId, { email: 'nobody@example.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects when the password is wrong', async () => {
      model.findOne.mockReturnValue(queryMock(storedCustomer));

      await expect(
        service.login(storeId, { email: storedCustomer.email, password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects an admin-created customer that has no password', async () => {
      model.findOne.mockReturnValue(queryMock({ ...storedCustomer, passwordHash: undefined }));

      await expect(
        service.login(storeId, { email: storedCustomer.email, password: 'Jane123!' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a disabled customer', async () => {
      model.findOne.mockReturnValue(queryMock({ ...storedCustomer, status: CustomerStatus.DISABLED }));

      await expect(
        service.login(storeId, { email: storedCustomer.email, password: 'Jane123!' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('claims the guest cart when a cartToken is supplied', async () => {
      model.findOne.mockReturnValue(queryMock(storedCustomer));

      await service.login(storeId, { email: storedCustomer.email, password: 'Jane123!' }, 'cart-token-abc');

      expect(carts.claimCart).toHaveBeenCalledWith(storeId, 'cust-1', 'cart-token-abc');
    });

    it('does not touch the cart when no cartToken is supplied', async () => {
      model.findOne.mockReturnValue(queryMock(storedCustomer));

      await service.login(storeId, { email: storedCustomer.email, password: 'Jane123!' });

      expect(carts.claimCart).not.toHaveBeenCalled();
    });

    it('lowercases the email before lookup', async () => {
      model.findOne.mockReturnValue(queryMock(storedCustomer));

      await service.login(storeId, { email: 'JANE@Example.com', password: 'Jane123!' });

      expect(model.findOne).toHaveBeenCalledWith({ storeId, email: 'jane@example.com' });
    });
  });

  describe('register', () => {
    it('rejects a duplicate email', async () => {
      model.findOne.mockReturnValue(queryMock(storedCustomer));

      await expect(
        service.register(storeId, {
          email: storedCustomer.email,
          password: 'Jane123!',
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
      expect(model.create).not.toHaveBeenCalled();
    });

    it('hashes the password before storing and issues a token', async () => {
      model.findOne.mockReturnValue(queryMock(null));
      model.create.mockResolvedValue(storedCustomer);

      const res = await service.register(storeId, {
        email: 'new@example.com',
        password: 'plain-text',
        firstName: 'New',
        lastName: 'Customer',
      });

      const created = model.create.mock.calls[0][0];
      expect(created.passwordHash).not.toBe('plain-text');
      expect(await bcrypt.compare('plain-text', created.passwordHash)).toBe(true);
      expect(res.accessToken).toBe('signed.customer.token');
    });

    it('claims the guest cart on register', async () => {
      model.findOne.mockReturnValue(queryMock(null));
      model.create.mockResolvedValue(storedCustomer);

      await service.register(
        storeId,
        { email: 'new@example.com', password: 'Jane123!', firstName: 'New', lastName: 'Customer' },
        'cart-token-xyz',
      );

      expect(carts.claimCart).toHaveBeenCalledWith(storeId, 'cust-1', 'cart-token-xyz');
    });

    it('claims an existing passwordless guest customer instead of rejecting', async () => {
      // Guest checkout creates a customer without a password; registering with
      // the same email should claim it rather than throw ConflictException.
      const guestCustomer = {
        ...storedCustomer,
        passwordHash: undefined as string | undefined,
        firstName: '',
        lastName: '',
        phone: undefined,
        save: jest.fn().mockResolvedValue(undefined),
      };
      model.findOne.mockReturnValue(queryMock(guestCustomer));

      const res = await service.register(storeId, {
        email: storedCustomer.email,
        password: 'Jane123!',
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+36 30 123 4567',
      });

      expect(guestCustomer.save).toHaveBeenCalled();
      expect(guestCustomer.passwordHash).not.toBeUndefined();
      expect(await bcrypt.compare('Jane123!', guestCustomer.passwordHash as string)).toBe(true);
      expect(guestCustomer.firstName).toBe('Jane');
      expect(guestCustomer.lastName).toBe('Doe');
      expect(guestCustomer.phone).toBe('+36 30 123 4567');
      expect(model.create).not.toHaveBeenCalled();
      expect(res.accessToken).toBe('signed.customer.token');
    });
  });

  describe('validateById', () => {
    it('returns the auth payload when found', async () => {
      model.findById.mockReturnValue(queryMock(storedCustomer));

      const res = await service.validateById('cust-1');

      expect(res?.id).toBe('cust-1');
      expect(res?.email).toBe(storedCustomer.email);
    });

    it('returns null when not found', async () => {
      model.findById.mockReturnValue(queryMock(null));

      expect(await service.validateById('missing')).toBeNull();
    });
  });
});
