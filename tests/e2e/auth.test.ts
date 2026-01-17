import request from 'supertest';
import { Server } from '../../../src/server';
import { AppDataSource } from '../../../src/infrastructure/database/config/ormconfig';

describe('Auth E2E Tests', () => {
    let app: any;
    let accessToken: string;

    beforeAll(async () => {
        // Initialize database connection
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        // Create server instance
        const server = new Server();
        app = server.getApp();
    });

    afterAll(async () => {
        // Close database connection
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user', async () => {
            const uniqueEmail = `test${Date.now()}@example.com`;
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User',
                    email: uniqueEmail,
                    password: 'Test@123',
                })
                .expect(201);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');
            expect(response.body.user.email).toBe(uniqueEmail);
            expect(response.body.user.name).toBe('Test User');
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User',
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 409 for duplicate email', async () => {
            const email = `duplicate${Date.now()}@example.com`;

            // First registration
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User',
                    email: email,
                    password: 'Test@123',
                })
                .expect(201);

            // Second registration with same email
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Test User 2',
                    email: email,
                    password: 'Test@123',
                })
                .expect(409);

            expect(response.body).toHaveProperty('message');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        const testEmail = `login${Date.now()}@example.com`;
        const testPassword = 'Test@123';

        beforeAll(async () => {
            // Create a test user
            await request(app)
                .post('/api/v1/auth/register')
                .send({
                    name: 'Login Test User',
                    email: testEmail,
                    password: testPassword,
                });
        });

        it('should login successfully', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: testPassword,
                })
                .expect(200);

            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('accessToken');
            expect(response.body).toHaveProperty('refreshToken');

            accessToken = response.body.accessToken;
        });

        it('should return 400 for missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                })
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });

        it('should return 404 for non-existent user', async () => {
            await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123',
                })
                .expect(404);
        });

        it('should return 401 for invalid password', async () => {
            await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testEmail,
                    password: 'wrongPassword',
                })
                .expect(401);
        });
    });

    describe('GET /api/v1/users/me', () => {
        it('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name');
            expect(response.body).toHaveProperty('email');
        });

        it('should return 401 without token', async () => {
            await request(app)
                .get('/api/v1/users/me')
                .expect(401);
        });

        it('should return 401 with invalid token', async () => {
            await request(app)
                .get('/api/v1/users/me')
                .set('Authorization', 'Bearer invalidToken')
                .expect(401);
        });
    });
});
