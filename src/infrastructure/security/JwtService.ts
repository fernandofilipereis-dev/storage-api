import * as jwt from 'jsonwebtoken';
import { ITokenService } from '@domain/services/ITokenService';

export class JwtService implements ITokenService {
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly accessTokenExpiresIn: jwt.SignOptions['expiresIn'];
    private readonly refreshTokenExpiresIn: jwt.SignOptions['expiresIn'];

    constructor() {
        this.accessTokenSecret = process.env.JWT_SECRET || 'default-secret';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';
        this.accessTokenExpiresIn = (process.env.JWT_EXPIRES_IN || '24h') as jwt.SignOptions['expiresIn'];
        this.refreshTokenExpiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];
    }

    generateAccessToken(payload: Record<string, any>): string {
        return jwt.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiresIn,
        });
    }

    generateRefreshToken(payload: Record<string, any>): string {
        return jwt.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiresIn,
        });
    }

    verifyAccessToken(token: string): Record<string, any> {
        try {
            return jwt.verify(token, this.accessTokenSecret) as Record<string, any>;
        } catch (error) {
            throw new Error('Invalid or expired access token');
        }
    }

    verifyRefreshToken(token: string): Record<string, any> {
        try {
            return jwt.verify(token, this.refreshTokenSecret) as Record<string, any>;
        } catch (error) {
            throw new Error('Invalid or expired refresh token');
        }
    }
}
