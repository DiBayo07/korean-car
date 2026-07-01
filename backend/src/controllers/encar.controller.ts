import { Controller, Get, Post, Param, Query, Logger } from '@nestjs/common';
import { ItemService, SearchService } from '../services/encar-api.service';
import { DatabaseService } from '../services/database.service';
import type { SearchQuery } from '../types/encar.types';

@Controller('api')
export class CatalogController {
  private readonly logger = new Logger(CatalogController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Get('catalog/manufacturers')
  async getManufacturers() {
    try {
      const brands = await this.databaseService.getDistinctBrands();
      return { success: true, data: { count: brands.length, results: brands } };
    } catch (error) {
      this.logger.error(`Failed to get brands: ${(error as Error).message}`);
      return { success: false, data: { count: 0, results: [] } };
    }
  }

  @Get('catalog/model-groups/:slug')
  async getModelGroups(@Param('slug') slug: string) {
    try {
      const models = await this.databaseService.getModelsByBrand(slug);
      return { success: true, data: { count: models.length, results: models } };
    } catch (error) {
      this.logger.error(`Failed to get models for ${slug}: ${(error as Error).message}`);
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
  async getItem(@Param('id') id: string) {
    try {
      this.logger.debug(`Item request: ${id}`);
      const detail = await this.itemService.getItem(id);
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

@Controller('api/admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly databaseService: DatabaseService,
  ) {}

  @Get('stats')
  async getStats() {
    try {
      const stats = await this.databaseService.getStats();
      return { success: true, data: stats };
    } catch (error) {
      this.logger.error(`Admin stats failed: ${(error as Error).message}`);
      return { success: false, message: 'Failed to get stats.' };
    }
  }

  @Post('refresh')
  async refresh() {
    try {
      this.logger.log('Admin refresh triggered');
      const result = await this.searchService.fetchAndStoreFromApify();
      const stats = await this.databaseService.getStats();
      return {
        success: true,
        data: {
          added: result.added,
          skipped: result.skipped,
          totalCars: stats.totalCars,
          lastUpdated: stats.lastUpdated,
        },
      };
    } catch (error) {
      this.logger.error(`Admin refresh failed: ${(error as Error).message}`);
      return { success: false, message: 'Refresh failed.' };
    }
  }
}
