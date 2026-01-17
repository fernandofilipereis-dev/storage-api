import { DataSource } from 'typeorm';
import { UserEntity } from '../entities/UserEntity';

export const AppDataSource = new DataSource({
    type: 'mariadb',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'storage_user',
    password: process.env.DB_PASSWORD || 'storage_password',
    database: process.env.DB_DATABASE || 'storage_db',
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
    entities: [UserEntity],
    migrations: ['src/infrastructure/database/migrations/*.ts'],
    subscribers: [],
    charset: 'utf8mb4',
    timezone: 'Z',
});
