import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Car } from '../entities/car.entity';
import { EncarCar } from '../entities/encar-car.entity';

export interface CarFilters {
  brand?: string;
  model?: string;
  yearFrom?: number;
  yearTo?: number;
  priceFrom?: number;
  priceTo?: number;
  fuel?: string;
  transmission?: string;
  limit?: number;
  offset?: number;
}

export interface AddCarsResult {
  added: number;
  skipped: number;
}

export interface DbStats {
  totalCars: number;
  lastUpdated: string | null;
}

/**
 * Accepts raw data from Apify with `images` as string[]; we auto-serialize to JSON.
 */
export interface RawCarInput {
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

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(EncarCar)
    private readonly encarCarRepository: Repository<EncarCar>,
  ) {}

  /**
   * Adds new cars to the database, skipping any that already exist by id.
   * Never updates existing records.
   */
  async addNewCars(newCars: RawCarInput[]): Promise<AddCarsResult> {
    if (newCars.length === 0) return { added: 0, skipped: 0 };

    try {
      // Get all existing ids in one query
      const ids = newCars.map((c) => c.id);
      const existing = await this.carRepository.find({
        where: { id: In(ids) },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((c) => c.id));

      const toInsert = newCars
        .filter((c) => !existingIds.has(c.id))
        .map((c) => {
          const car = new Car();
          car.id = c.id;
          car.title = c.title;
          car.price = c.price;
          car.year = c.year;
          car.mileage = c.mileage;
          car.fuel = c.fuel;
          car.transmission = c.transmission;
          car.imageArray = c.images; // auto-serializes to JSON
          car.brand = c.brand;
          car.model = c.model;
          car.dealer_name = c.dealer_name || null;
          return car;
        });

      const skipped = newCars.length - toInsert.length;

      if (toInsert.length > 0) {
        await this.carRepository.save(toInsert);
        this.logger.log(`Added ${toInsert.length} new cars (skipped ${skipped} existing)`);
      } else {
        this.logger.log(`All ${skipped} cars already exist in database, nothing added`);
      }

      return { added: toInsert.length, skipped };
    } catch (error) {
      this.logger.error(`Failed to add new cars: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Returns the total count of cars in the database.
   */
  async getTotalCount(): Promise<number> {
    return this.carRepository.count();
  }

  /**
   * Searches cars by the given filters with pagination.
   * Supports brand, model, year range, price range, fuel, transmission.
   */
  async getCars(filters: CarFilters = {}): Promise<{ items: Car[]; total: number }> {
    const {
      brand, model, yearFrom, yearTo, priceFrom, priceTo, fuel, transmission,
      limit = 20, offset = 0,
    } = filters;

    const where: Record<string, unknown> = {};
    if (brand) where.brand = Like(`%${brand}%`);
    if (model) where.model = Like(`%${model}%`);
    if (fuel) where.fuel = Like(`%${fuel}%`);
    if (transmission) where.transmission = Like(`%${transmission}%`);

    if (yearFrom !== undefined && yearTo !== undefined) {
      where.year = Between(yearFrom, yearTo);
    } else if (yearFrom !== undefined) {
      where.year = MoreThanOrEqual(yearFrom);
    } else if (yearTo !== undefined) {
      where.year = LessThanOrEqual(yearTo);
    }

    if (priceFrom !== undefined && priceTo !== undefined) {
      where.price = Between(priceFrom, priceTo);
    } else if (priceFrom !== undefined) {
      where.price = MoreThanOrEqual(priceFrom);
    } else if (priceTo !== undefined) {
      where.price = LessThanOrEqual(priceTo);
    }

    try {
      const [items, total] = await this.carRepository.findAndCount({
        where,
        order: { updated_at: 'DESC' },
        take: Math.min(limit, 100),
        skip: offset,
      });
      return { items, total };
    } catch (error) {
      this.logger.error(`Failed to query cars: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Gets a single car by its id. Returns null if not found.
   */
  async getCarById(id: string): Promise<Car | null> {
    try {
      return await this.carRepository.findOneBy({ id });
    } catch (error) {
      this.logger.error(`Failed to get car ${id}: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Сохраняет или обновляет массив машин из вебхука Encar (36789.ru).
   * Использует upsert на основе id. При ошибке конкретной машины — логирует и продолжает.
   */
  async saveEncarCars(cars: any[]): Promise<{ saved: number; failed: number }> {
    let saved = 0;
    let failed = 0;

    for (const raw of cars) {
      try {
        const ids = raw.ids || {};
        const general = raw.general || {};
        const carId = ids.id;
        if (!carId) {
          this.logger.warn('Car without id, skipping');
          failed++;
          continue;
        }

        const formattedPhotos = Array.isArray(raw.photos)
          ? raw.photos.map(
              (p: string) =>
                `https://ci.encar.com/carpicture${p.startsWith('/') ? '' : '/'}${p}`,
            )
          : [];

        const encarCar: Partial<EncarCar> = {
          id: carId,
          donor_inner_id: ids.donor_inner_id || null,
          vin: ids.vin || null,
          vehicle_no: ids.vehicle_no || null,
          brand: general.brand?.en || null,
          model: general.model?.en || null,
          price: general.price ?? null,
          mileage: general.mileage ?? null,
          year: general.model_year ?? null,
          fuel: general.fuel_type?.en || null,
          transmission: general.transmission_type?.en || null,
          body_type: general.body_type?.en || null,
          color: general.exterior_color?.en || null,
          interior_color: general.interior_color?.en || null,
          displacement: general.displacement ?? null,
          seat_count: general.seat_count ?? null,
          has_accidents: general.has_accidents ?? null,
          accident_count: general.accident_count ?? null,
          has_repairs: general.has_repairs ?? null,
          has_painting: general.has_painting ?? null,
          repairs_total_cost: general.repairs_total_cost ?? null,
          has_waterlog: general.has_waterlog ?? null,
          owner_changes_count: general.owner_changes_count ?? null,
          date_car_registration: general.date_car_registration || null,
          date_post_created: general.date_post_created || null,
          date_post_updated: general.date_post_updated || null,
          photos: formattedPhotos,
          options: raw.options || null,
          diagnosis: raw.diagnosis || null,
          inspection: raw.inspection || null,
        };

        await this.encarCarRepository.upsert(encarCar, ['id']);
        saved++;
      } catch (error) {
        this.logger.error(
          `Failed to save EncarCar: ${(error as Error).message}`,
        );
        failed++;
      }
    }

    this.logger.log(`EncarCars saved: ${saved}, failed: ${failed}`);
    return { saved, failed };
  }

  /**
   * Returns distinct brands from the encar_cars table.
   */
  async getDistinctBrands(): Promise<{ name: string; slug: string }[]> {
    try {
      const cars = await this.encarCarRepository
        .createQueryBuilder('car')
        .select('car.brand', 'name')
        .where('car.brand IS NOT NULL')
        .andWhere("car.brand != ''")
        .groupBy('LOWER(car.brand)')
        .orderBy('car.brand', 'ASC')
        .getRawMany();

      return cars.map((c: { name: string }) => ({
        name: c.name,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
    } catch (error) {
      this.logger.error(`Failed to get distinct brands: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Returns unique models for a given brand from the encar_cars table.
   * Matching is case-insensitive.
   */
  async getModelsByBrand(brandSlug: string): Promise<{ name: string; slug: string }[]> {
    try {
      const cars = await this.encarCarRepository
        .createQueryBuilder('car')
        .select('car.model', 'name')
        .where('car.model IS NOT NULL')
        .andWhere("car.model != ''")
        .andWhere('LOWER(car.brand) = LOWER(:brandSlug)', { brandSlug })
        .groupBy('LOWER(car.model)')
        .orderBy('car.model', 'ASC')
        .getRawMany();

      return cars.map((c: { name: string }) => ({
        name: c.name,
        slug: c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      }));
    } catch (error) {
      this.logger.error(`Failed to get models by brand: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Returns statistics about the database.
   * Counts from encar_cars table where webhook data is stored.
   */
  async getStats(): Promise<DbStats> {
    try {
      const totalCars = await this.encarCarRepository.count();
      const lastCar = await this.encarCarRepository.findOne({
        order: { date_post_updated: 'DESC' },
      });
      return {
        totalCars,
        lastUpdated: lastCar?.date_post_updated || null,
      };
    } catch (error) {
      this.logger.error(`Failed to get stats: ${(error as Error).message}`);
      return { totalCars: 0, lastUpdated: null };
    }
  }
}
