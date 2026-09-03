import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Category } from '@ecom/types';
import { STOREFRONT_CONFIG } from '../config/storefront.config';

export interface CategoryNode extends Category {
  children: CategoryNode[];
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${STOREFRONT_CONFIG.apiBase}/categories`;

  private cache: Promise<Category[]> | null = null;

  /** Flat list, cached for the session — categories rarely change while shopping. */
  list(): Promise<Category[]> {
    if (!this.cache) {
      this.cache = firstValueFrom(this.http.get<Category[]>(this.base));
    }
    return this.cache;
  }

  async findBySlug(slug: string): Promise<Category | undefined> {
    const all = await this.list();
    return all.find((c) => c.slug === slug);
  }

  /** Builds a parent/child tree from the flat list the engine returns. */
  async tree(): Promise<CategoryNode[]> {
    const all = await this.list();
    const nodes = new Map<string, CategoryNode>(all.map((c) => [c._id, { ...c, children: [] }]));
    const roots: CategoryNode[] = [];
    for (const node of nodes.values()) {
      if (node.parentId && nodes.has(node.parentId)) {
        nodes.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }
}
