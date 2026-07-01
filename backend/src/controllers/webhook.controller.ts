// backend/src/controllers/webhook.controller.ts
import { Controller, Post, Body, Logger } from '@nestjs/common';
import * as zlib from 'zlib';
import { DatabaseService } from '../services/database.service';

@Controller('api/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly databaseService: DatabaseService) {}

  @Post('encar')
  async handleEncarWebhook(@Body() payload: any) {
    try {
      this.logger.log('Webhook received from 36789.ru');

      // Проверяем, что данные есть
      if (!payload?.data?.cars_gz_b64) {
        this.logger.warn('Missing cars_gz_b64 in payload');
        return { status: 200, message: 'OK' };
      }

      // Распаковываем данные
      const buffer = Buffer.from(payload.data.cars_gz_b64, 'base64');
      const decompressed = zlib.gunzipSync(buffer);
      const cars = JSON.parse(decompressed.toString('utf-8'));

      if (!Array.isArray(cars)) {
        this.logger.warn('Decompressed data is not an array');
        return { status: 200, message: 'OK' };
      }

      this.logger.log(`Received ${cars.length} cars`);

      // Сохраняем в базу
      const result = await this.databaseService.saveEncarCars(cars);
      this.logger.log(`Saved: ${result.saved}, Failed: ${result.failed}`);

    } catch (error) {
      this.logger.error(`Webhook error: ${error.message}`);
    }

    // Всегда возвращаем 200, чтобы сервис не дублировал отправку
    return { status: 200, message: 'OK' };
  }
}