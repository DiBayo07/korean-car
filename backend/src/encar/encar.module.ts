import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EncarController } from './encar.controller';
import { EncarService } from './encar.service';

@Module({
  imports: [HttpModule],
  controllers: [EncarController],
  providers: [EncarService],
})
export class EncarModule {}
