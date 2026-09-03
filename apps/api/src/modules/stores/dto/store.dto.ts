import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { StoreStatus } from '@ecom/types';

export class CreateStoreDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({ default: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ default: 'en-US' })
  @IsString()
  locale: string;

  @ApiProperty({ default: 'UTC' })
  @IsString()
  timezone: string;

  @ApiPropertyOptional({ enum: StoreStatus })
  @IsOptional()
  @IsEnum(StoreStatus)
  status?: StoreStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Store theme: primary/accent colors, logo, favicon, appearance, fonts, radius, announcement' })
  @IsOptional()
  @IsObject()
  theme?: {
    primaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
    appearance?: 'dark' | 'light' | 'auto';
    fontFamily?: string;
    headingFontFamily?: string;
    borderRadius?: number;
    announcement?: {
      text?: string;
      color?: string;
      background?: string;
      enabled?: boolean;
    };
  };

  @ApiPropertyOptional({ description: 'Stripe keys for this store' })
  @IsOptional()
  @IsObject()
  payment?: {
    stripeSecretKey?: string;
    stripePublishableKey?: string;
    stripeWebhookSecret?: string;
  };

  @ApiPropertyOptional({ description: 'Store-level SEO defaults: meta title, description, OG image, keywords' })
  @IsOptional()
  @IsObject()
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImageUrl?: string;
    keywords?: string[];
  };
}

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
