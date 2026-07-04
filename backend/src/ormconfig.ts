import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { EncarCar } from './entities/encar-car.entity';

const dbUrl = process.env.DATABASE_URL;
const isPostgres = dbUrl && (dbUrl.startsWith('postgres:') || dbUrl.startsWith('postgresql:'));

const ormconfig: TypeOrmModuleOptions = isPostgres
  ? {
      type: 'postgres',
      url: dbUrl,
      entities: [Car, EncarCar],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }
  : {
      type: 'better-sqlite3',
      database: (dbUrl || 'data/cars.db').replace(/^sqlite:/, ''),
      entities: [Car, EncarCar],
      synchronize: true,
    };

export default ormconfig;
