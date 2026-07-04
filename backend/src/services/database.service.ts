import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike, Between, In, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Car } from '../entities/car.entity';
import { EncarCar } from '../entities/encar-car.entity';

export interface CarFilters {
  brand?: string;
  model?: string;
  year?: number;
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
export class DatabaseService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    @InjectRepository(EncarCar)
    private readonly encarCarRepository: Repository<EncarCar>,
  ) {}

  async onApplicationBootstrap() {
    try {
      this.logger.log('Checking if database migration is needed for car years...');
      
      const count = await this.encarCarRepository
        .createQueryBuilder('car')
        .where('car.year IS NULL OR car.year = 0')
        .getCount();

      if (count > 0) {
        this.logger.log(`Found ${count} cars with invalid/zero year. Running year auto-migration...`);
        
        const batchSize = 1000;
        let offset = 0;
        
        while (true) {
          const cars = await this.encarCarRepository.find({
            where: [
              { year: 0 },
              { year: null }
            ],
            select: { id: true, date_car_registration: true, date_post_created: true },
            take: batchSize,
          });

          if (cars.length === 0) break;

          for (const car of cars) {
            let parsedYear = 2020; // Default fallback year
            const regDate = car.date_car_registration || car.date_post_created;
            if (regDate) {
              const regStr = String(regDate);
              const match4 = regStr.match(/(\d{4})/);
              if (match4) {
                parsedYear = parseInt(match4[1], 10);
              } else {
                const match2 = regStr.match(/^(\d{2})/);
                if (match2) {
                  const y2 = parseInt(match2[1], 10);
                  parsedYear = y2 > 50 ? 1900 + y2 : 2000 + y2;
                }
              }
            }
            car.year = parsedYear;
          }

          await this.encarCarRepository.save(cars);
          offset += cars.length;
          this.logger.log(`Migrated ${offset} / ${count} cars...`);
        }
        
        this.logger.log('Car years migration completed successfully!');
      } else {
        this.logger.log('No cars need year migration.');
      }
    } catch (err) {
      this.logger.error(`Failed to run car years migration: ${(err as Error).message}`);
    }
  }

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
   * Returns the total count of cars in the encar_cars table (webhook data).
   */
  async getTotalCount(): Promise<number> {
    return this.encarCarRepository.count();
  }

  generateDealerDescription(car: EncarCar): string {
    const parts: string[] = [];
    
    const brandModel = car.brand && car.model ? `${car.brand} ${car.model}` : 'Автомобиль';
    const yearStr = car.year ? `${car.year} года выпуска` : '';
    const mileageStr = car.mileage ? `пробег ${car.mileage.toLocaleString()} км` : '';
    const fuelStr = car.fuel ? `топливо: ${car.fuel}` : '';
    const transStr = car.transmission ? `КПП: ${car.transmission}` : '';
    const bodyStr = car.body_type ? `кузов: ${car.body_type}` : '';
    const colorStr = car.color ? `цвет: ${car.color}` : '';
    const dispStr = car.displacement ? `объем двигателя: ${car.displacement}cc` : '';

    const mainDetails = [fuelStr, transStr, bodyStr, colorStr, dispStr].filter(Boolean).join(', ');
    
    let mainSentence = `Автомобиль ${brandModel}`;
    if (yearStr) mainSentence += ` ${yearStr}`;
    if (mileageStr) mainSentence += `, ${mileageStr}`;
    if (mainDetails) mainSentence += `, ${mainDetails}`;
    mainSentence += '.';
    parts.push(mainSentence);

    if (car.has_accidents === true) {
      parts.push('В наличии ДТП.');
    } else if (car.has_accidents === false) {
      parts.push('Без ДТП.');
    }

    if (car.owner_changes_count !== null && car.owner_changes_count !== undefined) {
      parts.push(`Количество владельцев: ${car.owner_changes_count}.`);
    }

    if (car.repairs_total_cost !== null && car.repairs_total_cost !== undefined) {
      parts.push(`Стоимость ремонтов: ${car.repairs_total_cost.toLocaleString()} KRW.`);
    }

    if (car.has_repairs === true) {
      parts.push('Был ремонт.');
    }

    if (car.has_painting === true) {
      parts.push('Была покраска.');
    }

    if (car.has_waterlog === true) {
      parts.push('Был контакт с водой.');
    }

    parts.push('Полная диагностика доступна.');

    return parts.join(' ');
  }

  /**
   * Gets a single car by its id from encar_cars table. Returns null if not found.
   */
  async getCarById(id: string): Promise<EncarCar | null> {
    try {
      const car = await this.encarCarRepository.findOneBy({ id });
      if (car && (!car.description || car.description.trim() === '')) {
        car.description = this.generateDealerDescription(car);
      }
      return car;
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

    const cleanNum = (val: any): number | null => {
      if (val === null || val === undefined) return null;
      const num = Number(val);
      return !isNaN(num) ? num : null;
    };

    try {
      const countBefore = await this.encarCarRepository.count();
      this.logger.log(`Before save: ${countBefore} cars in DB`);
    } catch (err) {
      this.logger.error(`Failed to count cars before save: ${(err as Error).message}`);
    }

    for (const raw of cars) {
      try {
        this.logger.log('Received car data: ' + JSON.stringify(raw, null, 2));

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

        let parsedYear: number | null = null;
        if (general.model_year) {
          parsedYear = Number(general.model_year);
        } else if (general.year) {
          parsedYear = Number(general.year);
        } else if (general.form_year) {
          parsedYear = Number(general.form_year);
        }

        if (!parsedYear || parsedYear <= 0) {
          const regDate = general.date_car_registration || general.date_car_release || general.date_post_created;
          if (regDate) {
            const regStr = String(regDate);
            const match4 = regStr.match(/(\d{4})/);
            if (match4) {
              parsedYear = parseInt(match4[1], 10);
            } else {
              const match2 = regStr.match(/^(\d{2})/);
              if (match2) {
                const y2 = parseInt(match2[1], 10);
                parsedYear = y2 > 50 ? 1900 + y2 : 2000 + y2;
              }
            }
          }
        }

        if (parsedYear && parsedYear > 100000) {
          parsedYear = Math.floor(parsedYear / 100);
        }

        const encarCar: Partial<EncarCar> = {
          id: carId,
          donor_inner_id: ids.donor_inner_id || null,
          vin: ids.vin || null,
          vehicle_no: ids.vehicle_no || null,
          brand: general.brand?.en || null,
          model: general.model?.en || null,
          price: cleanNum(general.price),
          mileage: cleanNum(general.mileage),
          year: cleanNum(parsedYear),
          fuel: general.fuel_type?.en || null,
          transmission: general.transmission_type?.en || null,
          body_type: general.body_type?.en || null,
          color: general.exterior_color?.en || null,
          interior_color: general.interior_color?.en || null,
          displacement: cleanNum(general.displacement),
          seat_count: cleanNum(general.seat_count),
          has_accidents: general.has_accidents ?? null,
          accident_count: cleanNum(general.accident_count),
          has_repairs: general.has_repairs ?? null,
          has_painting: general.has_painting ?? null,
          repairs_total_cost: cleanNum(general.repairs_total_cost),
          has_waterlog: general.has_waterlog ?? null,
          owner_changes_count: cleanNum(general.owner_changes_count),
          date_car_registration: general.date_car_registration || general.date_car_release || null,
          date_post_created: general.date_post_created || null,
          date_post_updated: general.date_post_updated || null,
          photos: formattedPhotos,
          options: raw.options || null,
          diagnosis: raw.diagnosis || null,
          inspection: raw.inspection || null,
          description: raw.description || raw.note || general.description || general.note || null,
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

    try {
      const countAfter = await this.encarCarRepository.count();
      this.logger.log(`After save: ${countAfter} cars in DB`);
    } catch (err) {
      this.logger.error(`Failed to count cars after save: ${(err as Error).message}`);
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
        .select('DISTINCT car.brand', 'name')
        .where('car.brand IS NOT NULL')
        .andWhere("car.brand != ''")
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
   * Searches encar_cars by the given filters with pagination.
   * Supports brand, model, year range, price range, fuel, transmission.
   * This is the primary search method for webhook data.
   */
  async getCars(filters: CarFilters = {}): Promise<{ items: EncarCar[]; total: number }> {
    this.logger.log(`getCars called with filters: ${JSON.stringify(filters)}`);
    const {
      brand, model, year, yearFrom, yearTo, priceFrom, priceTo, fuel, transmission,
      limit = 20, offset = 0,
    } = filters;

    const where: Record<string, unknown> = {};
    if (brand) {
      const cleanBrand = brand.replace(/-/g, '%');
      where.brand = ILike(`%${cleanBrand}%`);
    }
    if (model) {
      const cleanModel = model.replace(/-/g, '%');
      where.model = ILike(`%${cleanModel}%`);
    }
    if (fuel) where.fuel = ILike(`%${fuel}%`);
    if (transmission) where.transmission = ILike(`%${transmission}%`);

    if (year !== undefined) {
      where.year = year;
    } else if (yearFrom !== undefined && yearTo !== undefined) {
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
      const [items, total] = await this.encarCarRepository.findAndCount({
        where,
        order: { date_post_updated: 'DESC' },
        take: Math.min(limit, 100),
        skip: offset,
      });
      this.logger.log(`Returning ${items.length} of ${total} cars`);
      for (const car of items) {
        if (!car.description || car.description.trim() === '') {
          car.description = this.generateDealerDescription(car);
        }
      }
      return { items, total };
    } catch (error) {
      this.logger.error(`Failed to query encar_cars: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Returns unique models for a given brand from the encar_cars table.
   * Uses LIKE for case-insensitive matching.
   */
  async getModelsByBrand(brandSlug: string): Promise<{ name: string; slug: string }[]> {
    try {
      const cleanBrand = brandSlug.replace(/-/g, '%');
      const cars = await this.encarCarRepository
        .createQueryBuilder('car')
        .select('DISTINCT car.model', 'name')
        .where('car.model IS NOT NULL')
        .andWhere("car.model != ''")
        .andWhere('LOWER(car.brand) LIKE LOWER(:brandSlug)', { brandSlug: `%${cleanBrand}%` })
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

  /**
   * Returns models for a specific manufacturer and model group from encar_cars.
   * Used for cascading dropdowns (generations).
   */
  async getModelsByManufacturerAndModelGroup(manufacturerSlug: string, modelGroupSlug: string): Promise<{ name: string; slug: string }[]> {
    try {
      const cleanManufacturer = manufacturerSlug.replace(/-/g, '%');
      const cleanModelGroup = modelGroupSlug.replace(/-/g, '%');
      const cars = await this.encarCarRepository
        .createQueryBuilder('car')
        .select('DISTINCT car.year', 'year')
        .where('car.year IS NOT NULL')
        .andWhere('car.year > 1000')
        .andWhere('LOWER(car.brand) LIKE LOWER(:manufacturerSlug)', { manufacturerSlug: `%${cleanManufacturer}%` })
        .andWhere('LOWER(car.model) LIKE LOWER(:modelGroupSlug)', { modelGroupSlug: `%${cleanModelGroup}%` })
        .orderBy('car.year', 'ASC')
        .getRawMany();

      return cars.map((c: { year: number }) => ({
        name: String(c.year),
        slug: String(c.year),
      }));
    } catch (error) {
      this.logger.error(`Failed to get models by manufacturer and model group: ${(error as Error).message}`);
      return [];
    }
  }
}
