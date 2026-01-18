import request from 'supertest';
import { Server } from '../../src/server';
import { AppDataSource } from '../../src/infrastructure/database/config/ormconfig';
import { UserEntity } from '../../src/infrastructure/database/entities/UserEntity';
import { JwtService } from '../../src/infrastructure/security/JwtService';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';

describe('User List E2E Tests', () => {
    let app: any;
    let accessToken: string;
    let userRepository: any;

    beforeAll(async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        userRepository = AppDataSource.getRepository(UserEntity);

        const server = new Server();
        app = server.getApp();

        // Clean users
        await userRepository.query('DELETE FROM users');

        // Create a test user for auth
        const passwordHash = await bcrypt.hash('password123', 10);
        const adminUser = userRepository.create({
            id: uuidv4(),
            name: 'Admin User',
            email: 'admin@example.com',
            password: passwordHash,
            isActive: true,
        });
        await userRepository.save(adminUser);

        const jwtService = new JwtService();
        accessToken = jwtService.generateAccessToken({ userId: adminUser.id });

        // Create more users for pagination tests
        const users = [];
        for (let i = 1; i <= 15; i++) {
            users.push(userRepository.create({
                id: uuidv4(),
                name: `User ${i.toString().padStart(2, '0')}`,
                email: `user${i}@example.com`,
                password: passwordHash,
                isActive: i <= 10, // 10 active, 5 inactive
                createdAt: new Date(Date.now() + i * 1000), // Ensure different creation times
            }));
        }
        await userRepository.save(users);
    });

    afterAll(async () => {
        await AppDataSource.destroy();
    });

    describe('GET /api/v1/users', () => {
        it('should list users with default pagination (limit 10)', async () => {
            const response = await request(app)
                .get('/api/v1/users')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(10);
            expect(response.body.meta.totalItems).toBeGreaterThanOrEqual(16); // 15 + 1 admin
            expect(response.body.meta.itemsPerPage).toBe(10);
            expect(response.body.meta.currentPage).toBe(1);
            expect(response.body.meta.hasNext).toBe(true);
            expect(response.body.meta.hasPrevious).toBe(false);
        });

        it('should list users with custom pagination', async () => {
            const response = await request(app)
                .get('/api/v1/users?page=2&limit=5')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(5);
            expect(response.body.meta.currentPage).toBe(2);
            expect(response.body.meta.itemsPerPage).toBe(5);
            expect(response.body.meta.hasNext).toBe(true);
            expect(response.body.meta.hasPrevious).toBe(true);
        });

        it('should sort users by name DESC', async () => {
            const response = await request(app)
                .get('/api/v1/users?sortBy=name&sortOrder=DESC')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data[0].name).toBe('User 15');
        });

        it('should filter users by search term', async () => {
            const response = await request(app)
                .get('/api/v1/users?search=05')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].name).toBe('User 05');
        });

        it('should filter users by active status', async () => {
            const response = await request(app)
                .get('/api/v1/users?isActive=false')
                .set('Authorization', `Bearer ${accessToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data.every((u: any) => u.isActive === false)).toBe(true);
            expect(response.body.meta.totalItems).toBe(5);
        });
    });
});
