import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';

const ormconfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: process.env.DATABASE_URL || './data/cars.db',
  entities: [Car],
  synchronize: true,
};

export default ormconfig;
