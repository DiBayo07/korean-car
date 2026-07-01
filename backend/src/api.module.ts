import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarapisService } from './services/carapis.service';
import { ApifyService } from './services/apify.service';
import { SearchService, ItemService } from './services/encar-api.service';
import { DatabaseService } from './services/database.service';
import { Car } from './entities/car.entity';
import { EncarCar } from './entities/encar-car.entity';
import {
  SearchController,
  ItemController,
  CatalogController,
  AdminController,
} from './controllers/encar.controller';
import { WebhookController } from './controllers/webhook.controller';
import { AppCacheModule } from './cache/cache.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 20000,
      maxRedirects: 3,
    }),
    AppCacheModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Car],
      synchronize: true,
      ssl: process.env.DATABASE_URL?.includes('supabase')
        ? { rejectUnauthorized: false }
        : undefined,
    }),
    TypeOrmModule.forFeature([Car, EncarCar]),
  ],
  controllers: [SearchController, ItemController, CatalogController, AdminController, WebhookController],
  providers: [CarapisService, ApifyService, SearchService, ItemService, DatabaseService],
})
export class ApiModule {}
