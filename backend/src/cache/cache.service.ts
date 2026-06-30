import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly searchTtlMs: number;
  private readonly detailTtlMs: number;

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {
    this.searchTtlMs = Number(process.env.CACHE_SEARCH_TTL_MS || 10 * 60 * 1000); // 10 minutes
    this.detailTtlMs = Number(process.env.CACHE_DETAIL_TTL_MS || 24 * 60 * 60 * 1000); // 24 hours
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.cache.get<T>(key);
    if (value) {
      this.logger.debug(`Cache hit: ${key}`);
    }
    return value ?? null;
  }

  async setSearch<T>(key: string, value: T): Promise<void> {
    await this.cache.set(key, value, this.searchTtlMs);
  }

  async setDetail<T>(key: string, value: T): Promise<void> {
    await this.cache.set(key, value, this.detailTtlMs);
  }
}
