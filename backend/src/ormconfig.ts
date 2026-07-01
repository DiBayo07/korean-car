import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { EncarCar } from './entities/encar-car.entity';

const ormconfig: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: (process.env.DATABASE_URL || 'data/cars.db').replace(/^sqlite:/, ''),
  entities: [Car, EncarCar],
  synchronize: true,
};

export default ormconfig;
