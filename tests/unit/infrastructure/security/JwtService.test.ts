import * as jwt from 'jsonwebtoken';
import { JwtService } from '../../../../src/infrastructure/security/JwtService';

describe('JwtService', () => {
    let jwtService: JwtService;
    const payload = { userId: '123', email: 'test@example.com' };

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-access-secret';
        process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
        process.env.JWT_EXPIRES_IN = '1h';
        process.env.JWT_REFRESH_EXPIRES_IN = '7d';
        jwtService = new JwtService();
    });

    describe('generateAccessToken', () => {
        it('should generate a valid access token', () => {
            const token = jwtService.generateAccessToken(payload);
            expect(token).toBeDefined();
            const decoded = jwt.verify(token, 'test-access-secret') as any;
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });
    });

    describe('generateRefreshToken', () => {
        it('should generate a valid refresh token', () => {
            const token = jwtService.generateRefreshToken(payload);
            expect(token).toBeDefined();
            const decoded = jwt.verify(token, 'test-refresh-secret') as any;
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });
    });

    describe('verifyAccessToken', () => {
        it('should verify a valid access token', () => {
            const token = jwt.sign(payload, 'test-access-secret');
            const decoded = jwtService.verifyAccessToken(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });

        it('should throw an error for an invalid access token', () => {
            expect(() => jwtService.verifyAccessToken('invalid-token')).toThrow('Invalid or expired access token');
        });
    });

    describe('verifyRefreshToken', () => {
        it('should verify a valid refresh token', () => {
            const token = jwt.sign(payload, 'test-refresh-secret');
            const decoded = jwtService.verifyRefreshToken(token);
            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });

        it('should throw an error for an invalid refresh token', () => {
            expect(() => jwtService.verifyRefreshToken('invalid-token')).toThrow('Invalid or expired refresh token');
        });
    });
});
