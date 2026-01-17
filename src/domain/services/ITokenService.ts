export interface ITokenService {
    generateAccessToken(payload: Record<string, any>): string;
    generateRefreshToken(payload: Record<string, any>): string;
    verifyAccessToken(token: string): Record<string, any>;
    verifyRefreshToken(token: string): Record<string, any>;
}
