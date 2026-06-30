import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CarapisService } from './services/carapis.service';
import { SearchService, ItemService } from './services/encar-api.service';
import {
  SearchController,
  ItemController,
  CatalogController,
} from './controllers/encar.controller';
import { AppCacheModule } from './cache/cache.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 20000,
      maxRedirects: 3,
    }),
    AppCacheModule,
  ],
  controllers: [SearchController, ItemController, CatalogController],
  providers: [CarapisService, SearchService, ItemService],
})
export class ApiModule {}
