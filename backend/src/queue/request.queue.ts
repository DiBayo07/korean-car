import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

type QueueTask<T> = () => Promise<T>;

interface QueueOptions {
  concurrency?: number;
  minDelayMs?: number;
}

@Injectable()
export class RequestQueue implements OnModuleDestroy {
  private readonly logger = new Logger(RequestQueue.name);
  private readonly concurrency: number;
  private readonly minDelayMs: number;
  private active = 0;
  private lastRunAt = 0;
  private readonly waiting: Array<{
    task: QueueTask<unknown>;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];
  private destroyed = false;

  constructor() {
    this.concurrency = Number(process.env.ENCAR_QUEUE_CONCURRENCY || 8);
    this.minDelayMs = Number(process.env.ENCAR_REQUEST_DELAY_MS || 300);
  }

  enqueue<T>(task: QueueTask<T>): Promise<T> {
    if (this.destroyed) {
      return Promise.reject(new Error('Request queue is shutting down'));
    }

    return new Promise<T>((resolve, reject) => {
      this.waiting.push({
        task: task as QueueTask<unknown>,
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.pump();
    });
  }

  getStats() {
    return {
      active: this.active,
      waiting: this.waiting.length,
      concurrency: this.concurrency,
    };
  }

  onModuleDestroy() {
    this.destroyed = true;
    const pending = this.waiting.splice(0);
    pending.forEach(({ reject }) => reject(new Error('Queue shutdown')));
    this.logger.log('Request queue destroyed');
  }

  private pump() {
    while (this.active < this.concurrency && this.waiting.length > 0) {
      const item = this.waiting.shift();
      if (!item) return;

      this.active += 1;
      this.run(item.task)
        .then(item.resolve)
        .catch(item.reject)
        .finally(() => {
          this.active -= 1;
          this.pump();
        });
    }
  }

  private async run<T>(task: QueueTask<T>): Promise<T> {
    const now = Date.now();
    const elapsed = now - this.lastRunAt;
    if (elapsed < this.minDelayMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minDelayMs - elapsed));
    }

    this.lastRunAt = Date.now();
    return task();
  }
}
