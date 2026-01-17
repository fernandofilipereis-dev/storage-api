import { Request, Response, NextFunction } from 'express';

export class ErrorMiddleware {
    static handle(err: Error, req: Request, res: Response, next: NextFunction): void {
        console.error('Error:', err);

        // Handle specific error types
        if (err.name === 'ValidationException') {
            res.status(400).json({
                error: 'Validation Error',
                message: err.message,
            });
            return;
        }

        if (err.name === 'NotFoundException') {
            res.status(404).json({
                error: 'Not Found',
                message: err.message,
            });
            return;
        }

        if (err.name === 'UnauthorizedException') {
            res.status(401).json({
                error: 'Unauthorized',
                message: err.message,
            });
            return;
        }

        if (err.name === 'ConflictException') {
            res.status(409).json({
                error: 'Conflict',
                message: err.message,
            });
            return;
        }

        // Default error response
        res.status(500).json({
            error: 'Internal Server Error',
            message: process.env.NODE_ENV === 'production' ? 'An error occurred' : err.message,
        });
    }
}
