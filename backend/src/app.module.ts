import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { WinstonModule, utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import { redisStore } from 'cache-manager-ioredis-yet';
import { EncarModule } from './encar/encar.module';

@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike('MyApp', {
              colors: true,
              appName: true,
            }),
          ),
        }),
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
        }),
      }),
    }),
    EncarModule,
  ],
})
export class AppModule {}
