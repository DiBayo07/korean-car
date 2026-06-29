import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as https from 'https';

// Encar changed their CloudFront rules - we use their old mobile/JSON API
// which still responds to requests from Korean IP ranges via proper Accept headers.
// The key insight: Encar's CDN routes based on CloudFront-Forwarded-For and
// the `sr` (sort/range) param must be properly formatted.

const ENCAR_SEARCH_URL = 'https://api.encar.com/search/car/list/general';
const ENCAR_CAR_URL = 'https://api.encar.com/cars';

const KO_HEADERS = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'Origin': 'https://www.encar.com',
  'Referer': 'https://www.encar.com/dc/dc_carsearchlist.do',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?1',
  'Sec-Ch-Ua-Platform': '"Android"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 12; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.193 Mobile Safari/537.36',
};

@Injectable()
export class EncarService {
  private readonly logger = new Logger(EncarService.name);
  private readonly httpsAgent: https.Agent;

  constructor(private readonly httpService: HttpService) {
    // Ignore self-signed certificates for dev, use proper certs in prod
    this.httpsAgent = new https.Agent({ keepAlive: true });
  }

  private rotateUserAgent(): string {
    const agents = [
      'Mozilla/5.0 (Linux; Android 12; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.193 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 11; SAMSUNG SM-A536B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/16.0 Chrome/92.0.4515.166 Mobile Safari/537.36',
    ];
    return agents[Math.floor(Math.random() * agents.length)];
  }

  private async fetchWithRetry(url: string, params: Record<string, any> = {}, retries = 3) {
    let lastErr: any;
    for (let i = 0; i < retries; i++) {
      try {
        const headers = { ...KO_HEADERS, 'User-Agent': this.rotateUserAgent() };
        const response = await firstValueFrom(
          this.httpService.get(url, {
            params,
            headers,
            httpsAgent: this.httpsAgent,
            timeout: 15000,
          }),
        );
        return response.data;
      } catch (err) {
        lastErr = err;
        const status = err?.response?.status;
        this.logger.warn(`Attempt ${i + 1} failed (status ${status ?? 'N/A'}): ${err.message}`);
        if (status === 404 || status === 403) break; // No point retrying
        await new Promise(r => setTimeout(r, (i + 1) * 1500));
      }
    }
    throw lastErr;
  }

  async searchCars(query: Record<string, string> = {}) {
    const brand = query.brand || '';
    const model = query.model || '';
    const yearFrom = query.yearFrom || '';
    const yearTo = query.yearTo || '';
    const priceFrom = query.priceFrom || '';
    const priceTo = query.priceTo || '';
    const count = query.count || '20';
    const page = query.page || '0';

    // Build Encar query string
    const conditions: string[] = ['And.Hidden.N.'];
    conditions.push('(C.CarType.Y.')
    if (brand) conditions.push(`_.Manufacturer.${brand}.`);
    if (model) conditions.push(`_.Model.${model}.`);
    conditions.push(')');
    const q = `(${conditions.join('')})`;

    const startIdx = parseInt(page, 10) * parseInt(count, 10);

    const params: Record<string, string> = {
      count,
      q,
      sr: `|ModifiedDate|${startIdx}|${count}`,
      inav: 'Manufacturer|Model|Year|Mileage|Price',
    };
    if (yearFrom) params['yearFrom'] = yearFrom;
    if (yearTo) params['yearTo'] = yearTo;
    if (priceFrom) params['priceMin'] = priceFrom;
    if (priceTo) params['priceMax'] = priceTo;

    try {
      const data = await this.fetchWithRetry(ENCAR_SEARCH_URL, params);
      if (!data || !data.SearchResults) {
        this.logger.warn('No SearchResults in Encar response');
        return { cars: [], total: 0 };
      }
      const cars = data.SearchResults.map((car: any) => ({
        id: String(car.Id),
        brand: car.Manufacturer || '',
        model: car.Model || '',
        trim: car.Badge || '',
        year: car.Year || 0,
        month: car.Month || null,
        mileage: car.Mileage || 0,
        price_usd: car.Price ? Math.round(car.Price / 1350) : 0,
        price_krw: car.Price || 0,
        image_url: car.Photos?.[0]?.location
          ? `https://ci.encar.com${car.Photos[0].location}`
          : 'https://via.placeholder.com/400x300?text=No+Image',
        images: (car.Photos || []).map((p: any) => `https://ci.encar.com${p.location}`),
        status: 'Available',
        type: 'car',
        fuel: car.FuelType || '',
        transmission: car.GearType || '',
        korean_name: car.ModelDetail || '',
      }));
      return { cars, total: data.Count || cars.length };
    } catch (err) {
      this.logger.error(`Error fetching from Encar: ${err.message}`);
      // Return stub data so frontend doesn't crash while debugging
      return { cars: [], total: 0, error: err.message };
    }
  }

  async getCarDetails(id: string) {
    try {
      const url = `${ENCAR_CAR_URL}/${id}`;
      const data = await this.fetchWithRetry(url);
      return {
        id: String(data.carId || id),
        brand: data.manufacturer || '',
        model: data.model || '',
        trim: data.badge || '',
        year: data.formYear || 0,
        month: data.formMonth || null,
        mileage: data.mileage || 0,
        price_usd: data.price ? Math.round(data.price / 1350) : 0,
        price_krw: data.price || 0,
        image_url: data.photos?.[0]?.location
          ? `https://ci.encar.com${data.photos[0].location}`
          : '',
        images: (data.photos || []).map((p: any) => `https://ci.encar.com${p.location}`),
        status: 'Available',
        type: 'car',
        fuel: data.fuelType || '',
        transmission: data.gearType || '',
        description: data.presentationText || '',
        inspectionAvailable: !!data.hasEncarCheck,
      };
    } catch (err) {
      this.logger.error(`Error fetching car ${id}: ${err.message}`);
      throw err;
    }
  }
}
