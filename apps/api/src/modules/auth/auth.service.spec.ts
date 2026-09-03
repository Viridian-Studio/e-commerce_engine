import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { AdminRole } from '@ecom/types';

describe('AuthService', () => {
  let userModel: { findOne: jest.Mock; create: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let service: AuthService;

  const storedUser = {
    _id: { toString: () => 'user-1' },
    email: 'admin@ecommerce.engine',
    name: 'Engine Admin',
    role: AdminRole.SUPER_ADMIN,
    storeIds: [],
    passwordHash: '',
  };

  beforeEach(async () => {
    storedUser.passwordHash = await bcrypt.hash('Admin123!', 10);
    userModel = { findOne: jest.fn(), create: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('signed.jwt.token') };
    service = new AuthService(userModel as any, jwtService as any, {} as any);
  });

  describe('login', () => {
    it('returns an access token and user payload on valid credentials', async () => {
      userModel.findOne.mockResolvedValue(storedUser);

      const res = await service.login({ email: 'admin@ecommerce.engine', password: 'Admin123!' });

      expect(res.accessToken).toBe('signed.jwt.token');
      expect(res.user).toEqual({
        id: 'user-1',
        email: storedUser.email,
        name: storedUser.name,
        role: AdminRole.SUPER_ADMIN,
        storeIds: [],
      });
      expect(jwtService.sign).toHaveBeenCalledWith(res.user);
    });

    it('rejects when the user does not exist', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'nobody@example.com', password: 'x' })).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('rejects when the password is wrong', async () => {
      userModel.findOne.mockResolvedValue(storedUser);

      await expect(
        service.login({ email: storedUser.email, password: 'wrong-password' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('lowercases the email before lookup', async () => {
      userModel.findOne.mockResolvedValue(storedUser);

      await service.login({ email: 'ADMIN@ecommerce.engine', password: 'Admin123!' });

      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'admin@ecommerce.engine' });
    });
  });

  describe('register', () => {
    it('rejects a duplicate email', async () => {
      userModel.findOne.mockResolvedValue(storedUser);

      await expect(
        service.register({ email: storedUser.email, name: 'X', password: 'y' } as any),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('hashes the password before storing', async () => {
      userModel.findOne.mockResolvedValue(null);
      userModel.create.mockResolvedValue(storedUser);

      await service.register({ email: 'new@example.com', name: 'New', password: 'plain-text' } as any);

      const created = userModel.create.mock.calls[0][0];
      expect(created.passwordHash).not.toBe('plain-text');
      expect(await bcrypt.compare('plain-text', created.passwordHash)).toBe(true);
    });
  });
});
