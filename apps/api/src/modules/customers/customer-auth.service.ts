import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { CartsService } from '../carts/carts.service';
import { CustomerRegisterDto, CustomerLoginDto } from './dto/customer-auth.dto';
import { CustomerStatus } from '@ecom/types';
import type { CustomerAuthUser, CustomerAuthResponse } from '@ecom/types';

function toAuthUser(c: CustomerDocument): CustomerAuthUser {
  return {
    id: c._id.toString(),
    storeId: c.storeId,
    email: c.email,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
  };
}

/**
 * Storefront-facing customer auth. Separate from the admin `AuthService`:
 * it issues tokens against the `Customer` model and uses the `customer-jwt`
 * Passport strategy. On login/register it also claims the caller's guest cart
 * (if a `cartToken` is supplied) so the cart follows the customer.
 */
@Injectable()
export class CustomerAuthService {
  constructor(
    @InjectModel(Customer.name) private readonly model: Model<CustomerDocument>,
    private readonly jwt: JwtService,
    private readonly carts: CartsService,
  ) {}

  async register(storeId: string, dto: CustomerRegisterDto, cartToken?: string): Promise<CustomerAuthResponse> {
    const email = dto.email.toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // A customer record may already exist without a password — guest checkout
    // creates one to attach orders to. In that case we "claim" it by setting
    // the password (and filling in name/phone if the guest left them blank)
    // instead of rejecting the registration. Only a customer that already has
    // a password is a true duplicate.
    const existing = await this.model.findOne({ storeId, email }).select('+passwordHash').exec();
    if (existing) {
      if (existing.passwordHash) throw new ConflictException('Email already registered');
      existing.passwordHash = passwordHash;
      if (!existing.firstName) existing.firstName = dto.firstName;
      if (!existing.lastName) existing.lastName = dto.lastName;
      if (!existing.phone && dto.phone) existing.phone = dto.phone;
      await existing.save();
      await this.claimCart(storeId, existing._id.toString(), cartToken);
      return this.issue(existing);
    }

    const doc = await this.model.create({
      storeId,
      email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      passwordHash,
      status: CustomerStatus.ACTIVE,
      addresses: [],
    });

    await this.claimCart(storeId, doc._id.toString(), cartToken);
    return this.issue(doc);
  }

  async login(storeId: string, dto: CustomerLoginDto, cartToken?: string): Promise<CustomerAuthResponse> {
    const email = dto.email.toLowerCase();
    const doc = await this.model.findOne({ storeId, email }).select('+passwordHash').exec();
    if (!doc || !doc.passwordHash) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, doc.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (doc.status === CustomerStatus.DISABLED) throw new UnauthorizedException('Account disabled');

    await this.claimCart(storeId, doc._id.toString(), cartToken);
    return this.issue(doc);
  }

  async validateById(id: string): Promise<CustomerAuthUser | null> {
    const doc = await this.model.findById(id).exec();
    return doc ? toAuthUser(doc) : null;
  }

  private async claimCart(storeId: string, customerId: string, cartToken?: string): Promise<void> {
    if (!cartToken) return;
    try {
      await this.carts.claimCart(storeId, customerId, cartToken);
    } catch {
      // A stale/invalid cart token must not break authentication.
    }
  }

  private issue(doc: CustomerDocument): CustomerAuthResponse {
    const customer = toAuthUser(doc);
    const accessToken = this.jwt.sign(customer);
    return { accessToken, customer };
  }
}
