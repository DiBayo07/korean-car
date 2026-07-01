import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ApifyService } from './apify.service';
import { DatabaseService, RawCarInput } from './database.service';
import { CacheService } from '../cache/cache.service';
import { SearchResponseDto, SearchItemDto, ItemDetailDto, SearchQuery } from '../types/encar.types';

const DB_MIN_CARS_THRESHOLD = 100;
const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly apifyService: ApifyService,
    private readonly databaseService: DatabaseService,
    private readonly cacheService: CacheService,
  ) {}

  async search(query: SearchQuery): Promise<SearchResponseDto> {
    const type: 'car' | 'moto' = query.type === 'moto' || query.type === 'bike' ? 'moto' : 'car';
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    if (type === 'moto') {
      return { total: 0, page, limit, items: [] };
    }

    // Check if we need to fetch new data from Apify
    const totalInDb = await this.databaseService.getTotalCount();
    if (totalInDb < DB_MIN_CARS_THRESHOLD) {
      this.logger.log(`Only ${totalInDb} cars in DB, fetching from Apify...`);
      await this.fetchAndStoreFromApify();
    }

    // Check 5-min cache for this specific query
    const cacheKey = `search:db:${JSON.stringify({ ...query, page, limit })}`;
    const cached = await this.cacheService.get<SearchResponseDto>(cacheKey);
    if (cached) return cached;

    try {
      // Query from database
      const result = await this.databaseService.getCars({
        brand: query.brand,
        model: query.model,
        yearFrom: query.yearFrom ? Number(query.yearFrom) : undefined,
        yearTo: query.yearTo ? Number(query.yearTo) : undefined,
        priceFrom: query.priceFrom ? Number(query.priceFrom) : undefined,
        priceTo: query.priceTo ? Number(query.priceTo) : undefined,
        fuel: query.fuel,
        transmission: query.transmission,
        limit,
        offset: (page - 1) * limit,
      });

      const items: SearchItemDto[] = result.items.map((car) => ({
        id: car.id,
        title: car.brand && car.model ? `${car.brand} ${car.model}` : 'Unknown',
        price: car.price || 0,
        year: car.year || 0,
        mileage: car.mileage || 0,
        fuel: car.fuel || '',
        transmission: car.transmission || '',
        images: car.photos || [],
        thumbnail: car.photos?.[0] || '',
        source: 'encar' as const,
        brand: car.brand,
        model: car.model,
        type: 'car',
      }));

      const response: SearchResponseDto = {
        total: result.total,
        page,
        limit,
        items,
      };

      // Cache the result for 5 minutes
      await this.cacheService.setSearch(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error(`Search failed: ${(error as Error).message}`);
      return { total: 0, page, limit, items: [] };
    }
  }

  /**
   * Fetches car listings from Apify and stores them in the database.
   * Only adds new cars, never updates existing ones.
   */
  async fetchAndStoreFromApify(): Promise<{ added: number; skipped: number }> {
    try {
      const apifyResult = await this.apifyService.fetchCarListings(100);

      if (!apifyResult.success || apifyResult.items.length === 0) {
        this.logger.warn('Apify returned no results');
        return { added: 0, skipped: 0 };
      }

      // Map Apify items to database input format
      const carsToAdd: RawCarInput[] = apifyResult.items.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        year: item.year,
        mileage: item.mileage,
        fuel: item.fuel,
        transmission: item.transmission,
        images: item.images,
        brand: item.brand,
        model: item.model,
        dealer_name: item.dealer_name,
      }));

      const result = await this.databaseService.addNewCars(carsToAdd);
      this.logger.log(`Apify fetch complete: added ${result.added}, skipped ${result.skipped}`);
      return result;
    } catch (error) {
      this.logger.error(`fetchAndStoreFromApify failed: ${(error as Error).message}`);
      return { added: 0, skipped: 0 };
    }
  }
}

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async getItem(id: string): Promise<ItemDetailDto> {
    try {
      const car = await this.databaseService.getCarById(id);

      if (!car) {
        throw new NotFoundException(`Item ${id} not found`);
      }

      const specs: Record<string, string> = {};
      if (car.fuel) specs['Fuel'] = car.fuel;
      if (car.transmission) specs['Transmission'] = car.transmission;
      if (car.mileage) specs['Mileage'] = `${car.mileage.toLocaleString()} km`;
      if (car.year) specs['Year'] = String(car.year);
      if (car.body_type) specs['Body Type'] = car.body_type;
      if (car.color) specs['Color'] = car.color;
      if (car.displacement) specs['Displacement'] = `${car.displacement}cc`;

      return {
        id: car.id,
        title: car.brand && car.model ? `${car.brand} ${car.model}` : 'Unknown',
        description: '',
        price: car.price || 0,
        year: car.year || 0,
        mileage: car.mileage || 0,
        fuel: car.fuel || '',
        transmission: car.transmission || '',
        images: car.photos || [],
        specifications: specs,
        sourceUrl: `https://www.encar.com/ve/${car.id}`,
        source: 'encar',
        brand: car.brand,
        model: car.model,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Item ${id} fetch failed: ${(error as Error).message}`);
      throw new NotFoundException(`Item ${id} not found`);
    }
  }

  async getItemLegacy(id: string): Promise<Record<string, unknown>> {
    try {
      const detail = await this.getItem(id);
      return {
        id: detail.id,
        brand: detail.brand,
        model: detail.model,
        year: detail.year,
        mileage: detail.mileage,
        price: detail.price,
        image_url: detail.images[0] || '',
        images: detail.images,
        status: 'Available',
        type: 'car',
        fuel: detail.fuel,
        transmission: detail.transmission,
        description: detail.description,
        sourceUrl: detail.sourceUrl,
      };
    } catch {
      throw new NotFoundException(`Item ${id} not found`);
    }
  }
}

