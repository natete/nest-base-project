import { Connection } from 'typeorm';
import { User } from './user.entity';
import { DatabaseConstants } from '../../database/database.constants';
import { AuthConstants } from '../auth.constants';

export const userReposiotryProvider = [
  {
    provide: AuthConstants.USER_REPOSITORY,
    useFactory: (connection: Connection) => connection.getRepository(User),
    inject: [DatabaseConstants.PROVIDER]
  }
];
