import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../../infrastructure/security/JwtService';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}

export class AuthMiddleware {
    private jwtService: JwtService;

    constructor() {
        this.jwtService = new JwtService();
    }

    authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                res.status(401).json({ error: 'No token provided' });
                return;
            }

            const parts = authHeader.split(' ');

            if (parts.length !== 2) {
                res.status(401).json({ error: 'Token error' });
                return;
            }

            const [scheme, token] = parts;

            if (!/^Bearer$/i.test(scheme)) {
                res.status(401).json({ error: 'Token malformatted' });
                return;
            }

            try {
                const decoded = this.jwtService.verifyAccessToken(token);
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                };
                next();
            } catch (error) {
                res.status(401).json({ error: 'Invalid token' });
                return;
            }
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
    };
}
