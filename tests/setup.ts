import 'reflect-metadata';
import 'dotenv/config';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DB_DATABASE = 'storage_db_test';

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
