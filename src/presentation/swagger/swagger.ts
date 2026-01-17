import swaggerJsdoc from 'swagger-jsdoc';
import { Config } from '../../infrastructure/config/Config';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Storage API',
            version: '1.0.0',
            description: 'TypeScript API with Clean Architecture and Domain Driven Design',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: `http://localhost:${Config.PORT}${Config.API_PREFIX}`,
                description: 'Development server',
            },
            {
                url: `https://api.example.com${Config.API_PREFIX}`,
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            description: 'User unique identifier',
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        isActive: {
                            type: 'boolean',
                            description: 'User account status',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Account creation timestamp',
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Last update timestamp',
                        },
                    },
                },
                AuthResponse: {
                    type: 'object',
                    properties: {
                        user: {
                            $ref: '#/components/schemas/User',
                        },
                        accessToken: {
                            type: 'string',
                            description: 'JWT access token',
                        },
                        refreshToken: {
                            type: 'string',
                            description: 'JWT refresh token',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error type',
                        },
                        message: {
                            type: 'string',
                            description: 'Error message',
                        },
                    },
                },
            },
        },
        tags: [
            {
                name: 'Auth',
                description: 'Authentication endpoints',
            },
            {
                name: 'Users',
                description: 'User management endpoints',
            },
        ],
    },
    apis: ['./src/presentation/controllers/*.ts', './src/presentation/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
