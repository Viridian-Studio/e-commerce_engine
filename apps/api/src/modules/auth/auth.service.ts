import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User, UserDocument } from './schemas/user.schema';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AdminRole } from '@ecom/types';
import type { AuthUser, LoginResponse } from '@ecom/types';

function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    storeIds: user.storeIds,
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const user = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user);
  }

  async register(dto: RegisterDto): Promise<LoginResponse> {
    const existing = await this.userModel.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new UnauthorizedException('Email already registered');
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      email: dto.email.toLowerCase(),
      name: dto.name,
      passwordHash,
      role: dto.role ?? AdminRole.STAFF,
      storeIds: dto.storeIds ?? [],
    });
    return this.issueTokens(user);
  }

  async validateUserById(id: string): Promise<AuthUser | null> {
    const user = await this.userModel.findById(id);
    return user ? toAuthUser(user) : null;
  }

  private issueTokens(user: UserDocument): LoginResponse {
    const payload: AuthUser = toAuthUser(user);
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, user: payload };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
