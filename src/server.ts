import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Config } from './infrastructure/config/Config';
import { rateLimitMiddleware } from './presentation/middlewares/RateLimitMiddleware';
import { ErrorMiddleware } from './presentation/middlewares/ErrorMiddleware';
import routes from './presentation/routes';

export class Server {
    private app: Application;

    constructor() {
        this.app = express();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupMiddlewares(): void {
        // Security middlewares
        this.app.use(helmet());
        this.app.use(cors({
            origin: Config.CORS_ORIGIN,
            credentials: true,
        }));

        // Body parsing
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        // Rate limiting
        this.app.use(rateLimitMiddleware);

        // Request logging in development
        if (Config.isDevelopment()) {
            this.app.use((_req, _res, next) => {
                console.log(`${_req.method} ${_req.path}`);
                next();
            });
        }
    }

    private setupRoutes(): void {
        // API routes
        this.app.use(Config.API_PREFIX, routes);

        // Root endpoint
        this.app.get('/', (_req, res) => {
            res.json({
                message: 'Storage API',
                version: '1.0.0',
                documentation: `${Config.API_PREFIX}/docs`,
            });
        });

        // Health check (outside API prefix for load balancers)
        this.app.get('/health', (_req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
            });
        });
    }

    private setupErrorHandling(): void {
        this.app.use(ErrorMiddleware.handle);
    }

    getApp(): Application {
        return this.app;
    }

    start(port: number): void {
        this.app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`📚 API Documentation: http://localhost:${port}${Config.API_PREFIX}/docs`);
            console.log(`🏥 Health check: http://localhost:${port}/health`);
            console.log(`🌍 Environment: ${Config.NODE_ENV}`);
        });
    }
}
