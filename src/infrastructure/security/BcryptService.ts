import * as bcrypt from 'bcrypt';
import { IPasswordHasher } from '../../domain/services/IPasswordHasher';

export class BcryptService implements IPasswordHasher {
    private readonly saltRounds: number;

    constructor() {
        this.saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
    }

    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRounds);
    }

    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
