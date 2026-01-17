export class Config {
    static readonly PORT = parseInt(process.env.PORT || '3000', 10);
    static readonly NODE_ENV = process.env.NODE_ENV || 'development';
    static readonly API_PREFIX = process.env.API_PREFIX || '/api/v1';

    static readonly DB_HOST = process.env.DB_HOST || 'localhost';
    static readonly DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
    static readonly DB_USERNAME = process.env.DB_USERNAME || 'storage_user';
    static readonly DB_PASSWORD = process.env.DB_PASSWORD || 'storage_password';
    static readonly DB_DATABASE = process.env.DB_DATABASE || 'storage_db';

    static readonly JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
    static readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
    static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
    static readonly JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

    static readonly RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
    static readonly RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

    static readonly CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

    static readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

    static isProduction(): boolean {
        return this.NODE_ENV === 'production';
    }

    static isDevelopment(): boolean {
        return this.NODE_ENV === 'development';
    }
}
