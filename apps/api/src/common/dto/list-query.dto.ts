import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { ListQuery, Paginated, PaginationMeta } from '@ecom/types';

export class ListQueryDto implements ListQuery {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 20;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  collectionId?: string;
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export function paginate<T>(data: T[], page: number, limit: number, total: number): Paginated<T> {
  return { data, meta: buildPaginationMeta(page, limit, total) };
}

export function toQuery(dto: ListQueryDto): {
  page: number;
  limit: number;
  search?: string;
  sortField?: string;
  sortOrder: 1 | -1;
} {
  return {
    page: dto.page ?? 1,
    limit: dto.limit ?? 20,
    search: dto.search,
    sortField: dto.sort,
    sortOrder: dto.order === 'asc' ? 1 : -1,
  };
}
