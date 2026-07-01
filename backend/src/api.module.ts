import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarapisService } from './services/carapis.service';
import { ApifyService } from './services/apify.service';
import { SearchService, ItemService } from './services/encar-api.service';
import { DatabaseService } from './services/database.service';
import { Car } from './entities/car.entity';
import {
  SearchController,
  ItemController,
  CatalogController,
  AdminController,
} from './controllers/encar.controller';
import { AppCacheModule } from './cache/cache.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 20000,
      maxRedirects: 3,
    }),
    AppCacheModule,
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: (process.env.DATABASE_URL || './data/cars.db').replace(/^sqlite:/, ''),
      entities: [Car],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Car]),
  ],
  controllers: [SearchController, ItemController, CatalogController, AdminController],
  providers: [CarapisService, ApifyService, SearchService, ItemService, DatabaseService],
})
export class ApiModule {}
