import 'reflect-metadata';
import { AppDataSource } from '../config/ormconfig';
import { UserEntity } from '../entities/UserEntity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

export async function seedUsers() {
    try {
        const userRepository = AppDataSource.getRepository(UserEntity);

        // Check if users already exist
        const existingUsers = await userRepository.count();
        if (existingUsers > 0) {
            console.log('Users already seeded, skipping...');
            return;
        }

        // Create admin user
        const adminPassword = await bcrypt.hash('Admin@123', 10);
        const adminUser = userRepository.create({
            id: uuidv4(),
            name: 'Admin User',
            email: 'admin@example.com',
            password: adminPassword,
            isActive: true,
        });

        // Create test user
        const testPassword = await bcrypt.hash('Test@123', 10);
        const testUser = userRepository.create({
            id: uuidv4(),
            name: 'Test User',
            email: 'test@example.com',
            password: testPassword,
            isActive: true,
        });

        await userRepository.save([adminUser, testUser]);

        console.log('Users seeded successfully!');
        console.log('Admin: admin@example.com / Admin@123');
        console.log('Test: test@example.com / Test@123');
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    }
}
