import { createConnection } from 'typeorm';
import { DatabaseConstants } from './database.constants';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export const databaseProviders = [
  {
    provide: DatabaseConstants.PROVIDER,
    useFactory: async () => await createConnection({
      type: process.env[DatabaseConstants.TYPE],
      host: process.env[DatabaseConstants.HOST],
      port: +process.env[DatabaseConstants.PORT],
      username: process.env[DatabaseConstants.USERNAME],
      password: process.env[DatabaseConstants.PASSWORD],
      logging: process.env[DatabaseConstants.LOGGING],
      logger: process.env[DatabaseConstants.LOGGER],
      database: process.env[DatabaseConstants.DATABASE],
      synchronize: Boolean(process.env[DatabaseConstants.SYNCHRONIZE]),
      entities: [
        __dirname + '/../**/*.entity{.ts,.js}'
      ]
    } as MysqlConnectionOptions)
  }
];