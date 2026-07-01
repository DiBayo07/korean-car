import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DatabaseService } from './src/services/database.service';
import { translateBrand } from './src/types/encar.types';
import * as fs from 'fs';
import * as path from 'path';

function transformApifyItem(item: Record<string, unknown>) {
  const manufacturer = String(item.manufacturer || '');
  const modelName = String(item.model || item.modelGroup || '');
  const badge = String(item.badge || item.grade || '');
  const title = [manufacturer, modelName, badge].filter(Boolean).join(' ');

  const images = extractImages(item);
  const year = Number(item.formYear || item.year || 0);

  return {
    id: String(item.id || item.url || ''),
    title,
    price: Number(item.price || item.priceManwon || 0),
    year,
    mileage: Number(item.mileage) || 0,
    fuel: String(item.fuelType || item.fuel || ''),
    transmission: String(item.transmission || ''),
    images,
    brand: translateBrand(manufacturer),
    model: modelName,
    dealer_name: String(item.dealerName || item.officeName || ''),
  };
}

function extractImages(item: Record<string, unknown>): string[] {
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
  if (item.mainPhotoUrl) {
    return [String(item.mainPhotoUrl)];
  }
  return [];
}

async function seedDatabase() {
  // cars.json is in the project root (one level up from backend/)
  const filePath = path.join(__dirname, '..', 'cars.json');
  console.log('📂 Looking for:', filePath);

  if (!fs.existsSync(filePath)) {
    console.error('❌ File cars.json not found at:', filePath);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf-8');
  const rawCars = JSON.parse(rawData);
  console.log('📦 Found ' + rawCars.length + ' cars in file');

  if (rawCars.length === 0) {
    console.log('❌ No data in file!');
    process.exit(1);
  }

  const cars = rawCars.map(transformApifyItem);
  console.log('🔄 Transformed ' + cars.length + ' records');

  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL не установлен.');
    console.log('   Укажите строку подключения к Supabase, например:');
    console.log('   DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres');
    console.log('   npx ts-node seed.ts');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  const dbService = app.get(DatabaseService);

  const result = await dbService.addNewCars(cars);
  console.log('✅ Added: ' + result.added + ', Skipped: ' + result.skipped);

  await app.close();
}

seedDatabase().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
