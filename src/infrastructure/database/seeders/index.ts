import 'reflect-metadata';
import 'dotenv/config';
import { AppDataSource } from '../config/ormconfig';
import { seedUsers } from './UserSeeder';

async function runSeeders() {
    try {
        console.log('Initializing database connection...');
        await AppDataSource.initialize();
        console.log('Database connected!');

        console.log('Running seeders...');
        await seedUsers();

        console.log('All seeders completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error running seeders:', error);
        process.exit(1);
    }
}

runSeeders();
