import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { CarapisService } from '../services/carapis.service';
import { ItemService, SearchService } from '../services/encar-api.service';
import type { SearchQuery } from '../types/encar.types';

@Controller('api')
export class CatalogController {
  private readonly logger = new Logger(CatalogController.name);

  constructor(private readonly carapis: CarapisService) {}

  @Get('catalog/manufacturers')
  async getManufacturers(@Query('country') country?: string) {
    try {
      const data = await this.carapis.getManufacturers({ country: country || 'KR', limit: 100 });
      return { success: true, data };
    } catch {
      return { success: false, data: { count: 0, results: [] } };
    }
  }

  @Get('catalog/model-groups/:slug')
  async getModelGroups(@Param('slug') slug: string) {
    try {
      const data = await this.carapis.getModelGroups(slug, { limit: 100 });
      return { success: true, data };
    } catch {
      return { success: false, data: { count: 0, results: [] } };
    }
  }

  @Get('catalog/models/:manSlug/:modelSlug')
  async getModels(@Param('manSlug') manSlug: string, @Param('modelSlug') modelSlug: string) {
    try {
      const data = await this.carapis.getModels(manSlug, modelSlug, { limit: 100 });
      return { success: true, data };
    } catch {
      return { success: false, data: { count: 0, results: [] } };
    }
  }
}

@Controller('api')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get('search')
  async search(@Query() query: Record<string, string>) {
    try {
      this.logger.debug(`Search request: ${JSON.stringify(query)}`);
      const result = await this.searchService.search(query as unknown as SearchQuery);
      return {
        success: true,
        total: result.total,
        page: result.page,
        limit: result.limit,
        items: result.items,
      };
    } catch (error) {
      this.logger.error(`Search failed: ${(error as Error).message}`);
      return {
        success: false,
        message: 'Search service temporarily unavailable.',
        total: 0,
        page: 1,
        limit: 20,
        items: [],
      };
    }
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

@Controller('api')
export class ItemController {
  private readonly logger = new Logger(ItemController.name);

  constructor(private readonly itemService: ItemService) {}

  @Get('item/:id')
  async getItem(@Param('id') id: string, @Query('type') type?: string) {
    try {
      const vehicleType = type === 'moto' || type === 'bike' ? 'moto' : 'car';
      this.logger.debug(`Item request: ${id} (${vehicleType})`);
      const detail = await this.itemService.getItem(id, vehicleType);
      return { success: true, data: detail };
    } catch (error) {
      this.logger.error(`Item ${id} failed: ${(error as Error).message}`);
      return { success: false, message: 'Item not found.' };
    }
  }

  @Get('car/:id')
  async getCarLegacy(@Param('id') id: string) {
    try {
      const detail = await this.itemService.getItemLegacy(id);
      return detail;
    } catch {
      return { success: false, message: 'Item not found.' };
    }
  }
}
