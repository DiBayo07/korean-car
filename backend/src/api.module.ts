import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    AppCacheModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: (process.env.DATABASE_URL || '/app/data/cars.db').replace(/^sqlite:/, ''),
      entities: [Car, EncarCar],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Car, EncarCar]),
  ],
  controllers: [SearchController, ItemController, CatalogController, AdminController, WebhookController],
  providers: [ApifyService, SearchService, ItemService, DatabaseService],
})
export class ApiModule {}
