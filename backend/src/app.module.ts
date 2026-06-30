import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { redisStore } from 'cache-manager-ioredis-yet';
import { ApiModule } from './api.module';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('EncarProxy', {
              colors: true,
              appName: true,
            }),
          ),
        }),
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        if (process.env.REDIS_HOST) {
          return {
            store: await redisStore({
              host: process.env.REDIS_HOST,
              port: parseInt(process.env.REDIS_PORT || '6379', 10),
            }),
          };
        }
        return {};
      },
    }),
    ApiModule,
  ],
})
export class AppModule {}
