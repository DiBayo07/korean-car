import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import UserAgent from 'user-agents';

@Injectable()
export class EncarService {
  private readonly logger = new Logger(EncarService.name);

  constructor(private readonly httpService: HttpService) {}

  private getHeaders() {
    const userAgent = new UserAgent(/Mobile|Android|iPhone/).toString();
    return {
      'User-Agent': userAgent,
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Referer': 'http://www.encar.com/',
      'Connection': 'keep-alive',
    };
  }

  private async fetchWithRetry(url: string, config: any, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        // Rotate User-Agent on each retry
        config.headers = { ...config.headers, ...this.getHeaders() };
        return await firstValueFrom(this.httpService.get(url, config));
      } catch (error) {
        this.logger.warn(`Attempt ${i + 1} failed for ${url}: ${error.message}`);
        if (i === retries - 1) throw error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }

  async searchCars(queryParam: any) {
    try {
      // Encar general search API
      const url = 'http://api.encar.com/search/car/list/general';
      const q = queryParam.q || '(And.Hidden.N._.(C.CarType.Y._.Manufacturer.현대.))';
      const count = queryParam.count || '20';
      const start = queryParam.start || '0';

      const response = await this.fetchWithRetry(url, {
        params: {
          count,
          q,
          sr: `|Mobile|${start}|${count}`,
        },
        timeout: 10000,
      });

      const data = response.data;
      if (!data || !data.SearchResults) {
        return { cars: [], total: 0 };
      }

      const cars = data.SearchResults.map((car: any) => ({
        id: car.Id,
        title: `${car.Manufacturer} ${car.Model} ${car.Badge}`,
        price: car.Price,
        mileage: car.Mileage,
        year: car.Year,
        fuelType: car.FuelType,
        images: car.Photos ? car.Photos.map((p: any) => p.location) : [],
        link: `http://www.encar.com/dc/dc_cardetailview.do?carid=${car.Id}`,
      }));

      return {
        cars,
        total: data.Count || cars.length,
      };
    } catch (error) {
      this.logger.error(`Error fetching search cars: ${error.message}`);
      throw error;
    }
  }

  async getCarDetails(id: string) {
    try {
      // Fallback details scraping logic if v1/readables requires more tokens
      // We'll use v1/readables as a typical known endpoint
      const url = `http://api.encar.com/v1/readables/car/${id}`;
      const response = await this.fetchWithRetry(url, {
        timeout: 10000,
      });
      
      const car = response.data;
      return {
        id: car.carId || id,
        title: car.carName || `${car.manufacturer || ''} ${car.model || ''}`,
        price: car.price,
        mileage: car.mileage,
        year: car.formYear,
        fuelType: car.fuelType,
        transmission: car.transmission,
        images: car.photos ? car.photos.map((p: any) => p.path || p.location) : [],
        dealer: car.dealer ? {
          name: car.dealer.name,
          phone: car.dealer.phone,
        } : null,
        raw: car, // Includes extra details a frontend might need
      };
    } catch (error) {
      this.logger.error(`Error fetching car details for ${id}: ${error.message}`);
      throw error;
    }
  }
}
