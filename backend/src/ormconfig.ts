import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';

const ormconfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Car],
  synchronize: true,
  ssl: process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : undefined,
};

export default ormconfig;
