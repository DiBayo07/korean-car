import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface CarapisManufacturer {
  name: string;
  slug: string;
}

export interface CarapisModelGroup {
  name: string;
  slug: string;
}

export interface CarapisModel {
  name: string;
  slug: string;
}

export interface CarapisVehicleRaw {
  id: number;
  title: string;
  description?: string;
  price: number;
  year: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  images: string[];
  image: string;
  manufacturer: CarapisManufacturer;
  model_group: CarapisModelGroup;
  model?: { name: string; slug: string };
  trim?: string;
  color?: string;
  body_type?: string;
  engine_cc?: number;
  drive_type?: string;
  registration_date?: string;
  source_url?: string;
  location?: string;
  selling_area?: string;
  inspection_available?: boolean;
  dealer_comment?: string;
  accident_history?: string;
  options?: string[];
}

export interface CarapisListResponse {
  count: number;
  page: number;
  pages: number;
  limit: number;
  results: CarapisVehicleRaw[];
}

export interface CarapisSearchParams {
  limit?: number;
  page?: number;
  manufacturer_slug?: string;
  model_group_slug?: string;
  model_slug?: string;
  min_year?: number;
  max_year?: number;
  fuel_type?: string;
  transmission?: string;
  price_from?: number;
  price_to?: number;
  search?: string;
  ordering?: string;
}

const API_BASE = 'https://carapis.com/apix/encar/v2';

@Injectable()
export class CarapisService {
  private readonly logger = new Logger(CarapisService.name);
  private readonly apiKey: string | undefined;

  constructor(private readonly httpService: HttpService) {
    this.apiKey = process.env.CARAPIS_API_KEY || undefined;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.apiKey) headers['Authorization'] = 'ApiKey ' + this.apiKey;
    return headers;
  }

  private async fetch<T>(path: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') query.set(key, String(val));
    });
    const qs = query.toString();
    const url = API_BASE + path + (qs ? '?' + qs : '');
    this.logger.debug('Carapis request: ' + url);
    try {
      const response = await firstValueFrom(this.httpService.get<T>(url, { headers: this.getHeaders(), timeout: 20000 }));
      return response.data;
    } catch (error) {
      this.logger.error('Carapis API error for ' + url + ': ' + (error as Error).message);
      throw new Error('Carapis API request failed');
    }
  }

  async getManufacturers(params: { limit?: number; search?: string; country?: string } = {}): Promise<{ count: number; results: CarapisManufacturer[] }> {
    return this.fetch('/catalog/manufacturers/', { limit: params.limit || 100, search: params.search, country: params.country || 'KR' });
  }

  async getModelGroups(manufacturerSlug: string, params: { limit?: number; search?: string } = {}): Promise<{ count: number; results: CarapisModelGroup[] }> {
    return this.fetch('/catalog/model-groups/', { limit: params.limit || 100, search: params.search, 'manufacturer__slug': manufacturerSlug });
  }

  async getModels(manufacturerSlug: string, modelGroupSlug: string, params: { limit?: number; search?: string } = {}): Promise<{ count: number; results: CarapisModel[] }> {
    return this.fetch('/catalog/models/', { limit: params.limit || 100, search: params.search, 'manufacturer__slug': manufacturerSlug, 'model_group__slug': modelGroupSlug });
  }

  async searchVehicles(params: CarapisSearchParams = {}): Promise<CarapisListResponse> {
    return this.fetch<CarapisListResponse>('/vehicles/', {
      limit: params.limit, page: params.page,
      manufacturer_slug: params.manufacturer_slug, model_group_slug: params.model_group_slug, model_slug: params.model_slug,
      min_year: params.min_year, max_year: params.max_year,
      fuel_type: params.fuel_type, transmission: params.transmission,
      price_from: params.price_from, price_to: params.price_to,
      ordering: params.ordering || '-created_at', search: params.search,
    });
  }

  async getVehicleById(id: string | number): Promise<CarapisVehicleRaw> {
    return this.fetch<CarapisVehicleRaw>('/vehicles/' + id + '/');
  }
}
