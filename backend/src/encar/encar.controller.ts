import { Controller, Get, Param, Query, Logger, Inject } from '@nestjs/common';
import { EncarService } from './encar.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Controller('api')
export class EncarController {
  private readonly logger = new Logger(EncarController.name);

  constructor(
    private readonly encarService: EncarService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get('search')
  async search(@Query() query: any) {
    const cacheKey = `search:${JSON.stringify(query)}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    
    if (cachedData) {
      this.logger.log(`Cache hit for search: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`Fetching search results from Encar for: ${cacheKey}`);
    const results = await this.encarService.searchCars(query);

    // Cache for 30 minutes (1800000 ms)
    await this.cacheManager.set(cacheKey, results, 1800000); 

    return results;
  }

  @Get('car/:id')
  async getCarDetails(@Param('id') id: string) {
    const cacheKey = `car:${id}`;
    const cachedData = await this.cacheManager.get(cacheKey);
    
    if (cachedData) {
      this.logger.log(`Cache hit for car details: ${id}`);
      return cachedData;
    }

    this.logger.log(`Fetching car details from Encar for: ${id}`);
    const details = await this.encarService.getCarDetails(id);

    // Cache for 24 hours (86400000 ms)
    await this.cacheManager.set(cacheKey, details, 86400000);

    return details;
  }
}
