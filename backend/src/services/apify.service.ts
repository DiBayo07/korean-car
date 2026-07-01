import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CacheService } from '../cache/cache.service';
import { translateBrand } from '../types/encar.types';

export interface ApifyListingItem {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  fuel: string;
  transmission: string;
  images: string[];
  brand: string;
  model: string;
  dealer_name?: string;
}

export interface ApifyFetchResult {
  success: boolean;
  items: ApifyListingItem[];
}

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
  };
}

@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);
  private readonly apiToken: string;
  private readonly baseUrl = 'https://api.apify.com/v2';
  private readonly actorId = 'piotrv1001/encar-listings-scraper';

  constructor(private readonly cacheService: CacheService) {
    this.apiToken = process.env.APIFY_API_TOKEN || '';
    if (!this.apiToken) {
      this.logger.warn('APIFY_API_TOKEN is not set - Apify service will return empty results');
    }
  }

  async fetchCarListings(limit: number = 50): Promise<ApifyFetchResult> {
    const cacheKey = `apify:listings:${limit}`;
    const cached = await this.cacheService.get<ApifyFetchResult>(cacheKey);
    if (cached) {
      this.logger.debug(`Returning cached Apify results (${cached.items.length} items)`);
      return cached;
    }
    if (!this.apiToken) {
      this.logger.error('APIFY_API_TOKEN is not configured');
      return { success: false, items: [] };
    }
    try {
      this.logger.log(`Starting Apify actor run with maxItems=${limit}`);
      const run = await this.startActorRun(limit);
      const finishedRun = await this.waitForRunCompletion(run.data.id);
      if (finishedRun.data.status !== 'SUCCEEDED') {
        this.logger.error(`Apify run ${run.data.id} finished with status: ${finishedRun.data.status}`);
        return { success: false, items: [] };
      }
      const items = await this.getDatasetItems(finishedRun.data.defaultDatasetId);
      const transformed = this.transformItems(items);
      const result: ApifyFetchResult = {
        success: true,
        items: transformed,
      };
      await this.cacheService.setSearch(cacheKey, result);
      this.logger.log(`Apify returned ${transformed.length} listings`);
      return result;
    } catch (error) {
      this.logger.error(`Apify fetchCarListings failed: ${(error as Error).message}`);
      return { success: false, items: [] };
    }
  }

  private async startActorRun(maxItems: number): Promise<ApifyRunResponse> {
    const url = `${this.baseUrl}/acts/${this.actorId}/runs`;
    const response = await axios.post<ApifyRunResponse>(
      url,
      {
        maxItems,
        carType: 'all',
        scrapeDetails: true,
      },
      {
        params: { token: this.apiToken },
        timeout: 30_000,
      },
    );
    return response.data;
  }

  private async waitForRunCompletion(runId: string, pollIntervalMs: number = 5_000): Promise<ApifyRunResponse> {
    const maxWaitMs = 120_000;
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitMs) {
      const url = `${this.baseUrl}/acts/${this.actorId}/runs/${runId}`;
      try {
        const response = await axios.get<ApifyRunResponse>(url, {
          params: {
            token: this.apiToken,
            waitForFinish: 30,
          },
          timeout: 35_000,
        });
        const status = response.data.data.status;
        this.logger.debug(`Apify run ${runId} status: ${status}`);
        if (['SUCCEEDED', 'FAILED', 'ABORTED', 'TIMED-OUT'].includes(status)) {
          return response.data;
        }
      } catch (error) {
        this.logger.warn(`Polling run ${runId} failed: ${(error as Error).message}`);
      }
      if (Date.now() - startTime < maxWaitMs) {
        await this.sleep(pollIntervalMs);
      }
    }
    throw new Error(`Apify run ${runId} did not complete within ${maxWaitMs / 1000}s`);
  }

  private async getDatasetItems(datasetId: string): Promise<Record<string, unknown>[]> {
    const url = `${this.baseUrl}/datasets/${datasetId}/items`;
    const response = await axios.get<Record<string, unknown>[]>(url, {
      params: {
        token: this.apiToken,
        format: 'json',
        clean: true,
      },
      timeout: 30_000,
    });
    return response.data;
  }

  private transformItems(rawItems: Record<string, unknown>[]): ApifyListingItem[] {
    return rawItems.map((item) => {
      const images = this.extractImages(item);
      const manufacturer = (item.manufacturer as string) || '';
      const modelName = (item.model as string) || (item.modelGroup as string) || '';
      const badge = (item.badge as string) || (item.grade as string) || '';
      const title = [manufacturer, modelName, badge].filter(Boolean).join(' ');
      const brand = this.translateBrand(manufacturer);
      return {
        id: String(item.id || item.url || ''),
        title,
        price: Number(item.price) || 0,
        year: Number(item.year || item.registrationYear || 0),
        mileage: Number(item.mileage) || 0,
        fuel: String(item.fuelType || item.fuel || ''),
        transmission: String(item.transmission || ''),
        images,
        brand,
        model: modelName,
        dealer_name: String(item.dealerName || item.seller || ''),
      };
    });
  }

  private extractImages(item: Record<string, unknown>): string[] {
    const possibleFields = ['images', 'photos', 'imageUrls', 'photoUrls', 'image_urls', 'photo_urls'];
    for (const field of possibleFields) {
      const value = item[field];
      if (Array.isArray(value) && value.length > 0) {
        return value.map((v: unknown) => String(v)).filter(Boolean);
      }
    }
    if (item.image || item.photo) {
      return [String(item.image || item.photo)];
    }
    return [];
  }

  private translateBrand(korean: string): string {
    return translateBrand(korean);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
