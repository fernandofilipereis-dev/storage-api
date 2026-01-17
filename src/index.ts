import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from './infrastructure/database/config/ormconfig';
import { Server } from './server';
import { Config } from './infrastructure/config/Config';

async function bootstrap() {
    try {
        // Initialize database connection
        console.log('🔌 Connecting to database...');
        await AppDataSource.initialize();
        console.log('✅ Database connected successfully!');

        // Start server
        const server = new Server();
        server.start(Config.PORT);
    } catch (error) {
        console.error('❌ Error starting application:', error);
        process.exit(1);
    }
}

bootstrap();
