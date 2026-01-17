import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'storage_user',
    password: process.env.DB_PASSWORD || 'storage_password',
    database: process.env.DB_DATABASE || 'storage_db',
    synchronize: process.env.NODE_ENV === 'test',
    logging: process.env.NODE_ENV === 'development' || process.env.DB_LOGGING === 'true',
    entities: [UserEntity],
    migrations: [process.env.NODE_ENV === 'test' ? 'src/infrastructure/database/migrations/*.ts' : 'dist/infrastructure/database/migrations/*.js'],
    subscribers: [],
    charset: 'utf8mb4',
    timezone: 'Z',
});
