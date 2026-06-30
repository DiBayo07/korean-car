import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CarapisService } from './carapis.service';
import { CacheService } from '../cache/cache.service';
import { SearchResponseDto, SearchItemDto, ItemDetailDto, SearchQuery, translateBrand } from '../types/encar.types';

const KRW_TO_USD = 1350;

function toUSD(krw: number): number {
  return Math.round(krw / KRW_TO_USD);
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly carapis: CarapisService,
    private readonly cacheService: CacheService,
  ) {}

  async search(query: SearchQuery): Promise<SearchResponseDto> {
    const type: 'car' | 'moto' = query.type === 'moto' || query.type === 'bike' ? 'moto' : 'car';
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));

    // If type is moto, use the moto API path
    if (type === 'moto') {
      return this.searchMoto(query, page, limit);
    }

    const cacheKey = `search:${JSON.stringify({ ...query, type, page, limit })}`;
    const cached = await this.cacheService.get<SearchResponseDto>(cacheKey);
    if (cached) return cached;

    try {
      const raw = await this.carapis.searchVehicles({
        limit,
        page,
        manufacturer_slug: query.brand || undefined,
        model_group_slug: query.model || undefined,
        min_year: query.yearFrom ? Number(query.yearFrom) : undefined,
        max_year: query.yearTo ? Number(query.yearTo) : undefined,
        price_from: query.priceFrom ? Number(query.priceFrom) * KRW_TO_USD : undefined,
        price_to: query.priceTo ? Number(query.priceTo) * KRW_TO_USD : undefined,
        fuel_type: query.fuel || undefined,
        transmission: query.transmission || undefined,
      });

      const items: SearchItemDto[] = (raw.results || []).map((v) => {
        const images = v.images || (v.image ? [v.image] : []);
        return {
          id: String(v.id),
          title: v.title,
          price: v.price,
          year: v.year,
          mileage: v.mileage,
          fuel: v.fuel_type || '',
          transmission: v.transmission || '',
          images,
          thumbnail: images[0] || '',
          source: 'encar' as const,
          brand: translateBrand(v.manufacturer?.name || ''),
          model: v.model_group?.name || v.model?.name || '',
          type: 'car',
        };
      });

      const response: SearchResponseDto = {
        total: raw.count || items.length,
        page: raw.page || page,
        limit: raw.limit || limit,
        items,
      };

      await this.cacheService.setSearch(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error(`Search failed: ${(error as Error).message}`);
      throw error;
    }
  }

  private async searchMoto(query: SearchQuery, page: number, limit: number): Promise<SearchResponseDto> {
    const cacheKey = `search:moto:${JSON.stringify({ ...query, page, limit })}`;
    const cached = await this.cacheService.get<SearchResponseDto>(cacheKey);
    if (cached) return cached;

    try {
      // Carapis API uses the same /vehicles/ endpoint for all types
      // If it doesn't support moto, we return empty
      const raw = await this.carapis.searchVehicles({
        limit,
        page,
        min_year: query.yearFrom ? Number(query.yearFrom) : undefined,
        max_year: query.yearTo ? Number(query.yearTo) : undefined,
        price_from: query.priceFrom ? Number(query.priceFrom) * KRW_TO_USD : undefined,
        price_to: query.priceTo ? Number(query.priceTo) * KRW_TO_USD : undefined,
      });

      // Filter to likely motorcycles (smaller engine, certain brands or model patterns)
      const motoResults = (raw.results || []).filter((v) => {
        const title = v.title?.toLowerCase() || '';
        const model = v.model_group?.name?.toLowerCase() || '';
        return (
          title.includes('bike') || title.includes('motor') ||
          title.includes('scooter') || title.includes('moto') ||
          model.includes('bike') || model.includes('motor') ||
          (v.engine_cc && v.engine_cc > 50 && v.engine_cc < 3000 && v.body_type === 'motorcycle')
        );
      });

      const items: SearchItemDto[] = (motoResults.length > 0 ? motoResults : raw.results || []).map((v) => {
        const images = v.images || (v.image ? [v.image] : []);
        return {
          id: String(v.id),
          title: v.title,
          price: v.price,
          year: v.year,
          mileage: v.mileage,
          fuel: v.fuel_type || '',
          transmission: v.transmission || '',
          images,
          thumbnail: images[0] || '',
          source: 'encar' as const,
          brand: translateBrand(v.manufacturer?.name || ''),
          model: v.model_group?.name || v.model?.name || '',
          type: 'moto',
        };
      });

      const response: SearchResponseDto = {
        total: items.length,
        page,
        limit,
        items,
      };

      await this.cacheService.setSearch(cacheKey, response);
      return response;
    } catch (error) {
      this.logger.error(`Moto search failed: ${(error as Error).message}`);
      return { total: 0, page, limit, items: [] };
    }
  }
}

@Injectable()
export class ItemService {
  private readonly logger = new Logger(ItemService.name);

  constructor(
    private readonly carapis: CarapisService,
    private readonly cacheService: CacheService,
  ) {}

  async getItem(id: string, type: 'car' | 'moto' = 'car'): Promise<ItemDetailDto> {
    const cacheKey = `item:${type}:${id}`;
    const cached = await this.cacheService.get<ItemDetailDto>(cacheKey);
    if (cached) return cached;

    try {
      const raw = await this.carapis.getVehicleById(id);

      const specs: Record<string, string> = {};
      if (raw.fuel_type) specs['Fuel'] = raw.fuel_type;
      if (raw.transmission) specs['Transmission'] = raw.transmission;
      if (raw.body_type) specs['Body Type'] = raw.body_type;
      if (raw.color) specs['Color'] = raw.color;
      if (raw.engine_cc) specs['Engine CC'] = String(raw.engine_cc);
      if (raw.drive_type) specs['Drive Type'] = raw.drive_type;
      if (raw.mileage) specs['Mileage'] = `${raw.mileage.toLocaleString()} km`;
      if (raw.year) specs['Year'] = String(raw.year);
      if (raw.accident_history) specs['Accident History'] = raw.accident_history;

      const detail: ItemDetailDto = {
        id: String(raw.id),
        title: raw.title,
        description: raw.description || raw.dealer_comment || '',
        price: raw.price,
        year: raw.year,
        mileage: raw.mileage,
        fuel: raw.fuel_type || '',
        transmission: raw.transmission || '',
        images: raw.images || (raw.image ? [raw.image] : []),
        specifications: specs,
        sourceUrl: raw.source_url || `https://www.encar.com/ve/${raw.id}`,
        source: 'encar',
        brand: translateBrand(raw.manufacturer?.name || ''),
        model: raw.model_group?.name || raw.model?.name || '',
        trim: raw.trim || undefined,
        color: raw.color,
        location: raw.location || raw.selling_area,
        inspectionAvailable: raw.inspection_available || false,
        engineCc: raw.engine_cc,
      };

      // Cache for 24 hours
      await this.cacheService.setDetail(cacheKey, detail);
      return detail;
    } catch (error) {
      this.logger.error(`Item ${id} fetch failed: ${(error as Error).message}`);
      throw new NotFoundException(`Item ${id} not found`);
    }
  }

  async getItemLegacy(id: string): Promise<Record<string, unknown>> {
    try {
      const detail = await this.getItem(id, 'car');
      return {
        id: detail.id,
        brand: detail.brand,
        model: detail.model,
        trim: detail.trim || '',
        year: detail.year,
        mileage: detail.mileage,
        price_usd: toUSD(detail.price),
        price_krw: detail.price,
        image_url: detail.images[0] || '',
        images: detail.images,
        status: 'Available',
        type: 'car',
        fuel: detail.fuel,
        transmission: detail.transmission,
        description: detail.description,
        inspectionAvailable: detail.inspectionAvailable,
        sourceUrl: detail.sourceUrl,
      };
    } catch {
      throw new NotFoundException(`Item ${id} not found`);
    }
  }
}
