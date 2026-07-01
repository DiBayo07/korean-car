import { Controller, Post, Body, Headers, Logger, ForbiddenException } from '@nestjs/common';
import * as zlib from 'zlib';
import { DatabaseService } from '../services/database.service';

interface WebhookPayload {
  task_id: string;
  user_id: string;
  data: {
    cars_gz_b64: string;
  };
}

@Controller('api/webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  private readonly expectedToken: string;
  private readonly expectedUserId: string;

  constructor(private readonly databaseService: DatabaseService) {
    this.expectedToken = process.env.ENCAR_WEBHOOK_TOKEN || '';
    this.expectedUserId = process.env.ENCAR_USER_ID || '';
  }

  @Post('encar')
  async handleEncarWebhook(
    @Headers('x-api-token') token: string,
    @Body() payload: WebhookPayload,
  ) {
    // Проверка токена
    if (token !== this.expectedToken) {
      this.logger.warn('Invalid webhook token: ' + token);
      throw new ForbiddenException('Forbidden');
    }

    // Проверка user_id
    if (payload.user_id !== this.expectedUserId) {
      this.logger.warn('Invalid user_id: ' + payload.user_id);
      throw new ForbiddenException('Forbidden');
    }

    try {
      // Распаковка данных
      const carsGzB64 = payload.data?.cars_gz_b64;
      if (!carsGzB64) {
        this.logger.warn('Missing cars_gz_b64 in payload');
        return { status: 200, message: 'OK' };
      }

      const buffer = Buffer.from(carsGzB64, 'base64');
      const decompressed = zlib.gunzipSync(buffer);
      const cars = JSON.parse(decompressed.toString('utf-8'));

      if (!Array.isArray(cars)) {
        this.logger.warn('Decompressed data is not an array');
        return { status: 200, message: 'OK' };
      }

      this.logger.log(
        'Received ' + cars.length + ' cars from webhook (task: ' + payload.task_id + ')',
      );

      // Сохранение
      const result = await this.databaseService.saveEncarCars(cars);
      this.logger.log(
        'Webhook processed: ' + result.saved + ' saved, ' + result.failed + ' failed',
      );
    } catch (error) {
      this.logger.error(
        'Webhook processing error: ' + (error as Error).message,
      );
      // Всегда возвращаем 200, чтобы сервис не дублировал отправку
    }

    return { status: 200, message: 'OK' };
  }
}
