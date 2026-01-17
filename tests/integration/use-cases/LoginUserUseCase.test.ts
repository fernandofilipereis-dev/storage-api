import { LoginUserUseCase } from '@application/use-cases/auth/LoginUserUseCase';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IPasswordHasher } from '@domain/services/IPasswordHasher';
import { ITokenService } from '@domain/services/ITokenService';
import { User } from '@domain/entities/User';
import { NotFoundException, UnauthorizedException } from '@domain/exceptions/DomainExceptions';

describe('LoginUserUseCase', () => {
    let loginUserUseCase: LoginUserUseCase;
    let mockUserRepository: jest.Mocked<IUserRepository>;
    let mockPasswordHasher: jest.Mocked<IPasswordHasher>;
    let mockTokenService: jest.Mocked<ITokenService>;

    beforeEach(() => {
        mockUserRepository = {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findAll: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
        };

        mockPasswordHasher = {
            hash: jest.fn(),
            compare: jest.fn(),
        };

        mockTokenService = {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            verifyAccessToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
        };

        loginUserUseCase = new LoginUserUseCase(
            mockUserRepository,
            mockPasswordHasher,
            mockTokenService
        );
    });

    it('should login user successfully', async () => {
        const loginDTO = {
            email: 'john@example.com',
            password: 'password123',
        };

        const user = new User({
            name: 'John Doe',
            email: loginDTO.email,
            password: 'hashedPassword123',
        });

        const accessToken = 'accessToken';
        const refreshToken = 'refreshToken';

        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockPasswordHasher.compare.mockResolvedValue(true);
        mockTokenService.generateAccessToken.mockReturnValue(accessToken);
        mockTokenService.generateRefreshToken.mockReturnValue(refreshToken);

        const result = await loginUserUseCase.execute(loginDTO);

        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(loginDTO.email);
        expect(mockPasswordHasher.compare).toHaveBeenCalledWith(loginDTO.password, user.password);
        expect(mockTokenService.generateAccessToken).toHaveBeenCalled();
        expect(mockTokenService.generateRefreshToken).toHaveBeenCalled();

        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('accessToken', accessToken);
        expect(result).toHaveProperty('refreshToken', refreshToken);
    });

    it('should throw NotFoundException when user does not exist', async () => {
        const loginDTO = {
            email: 'nonexistent@example.com',
            password: 'password123',
        };

        mockUserRepository.findByEmail.mockResolvedValue(null);

        await expect(loginUserUseCase.execute(loginDTO)).rejects.toThrow(NotFoundException);
        await expect(loginUserUseCase.execute(loginDTO)).rejects.toThrow('User not found');
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
        const loginDTO = {
            email: 'john@example.com',
            password: 'wrongPassword',
        };

        const user = new User({
            name: 'John Doe',
            email: loginDTO.email,
            password: 'hashedPassword123',
        });

        mockUserRepository.findByEmail.mockResolvedValue(user);
        mockPasswordHasher.compare.mockResolvedValue(false);

        await expect(loginUserUseCase.execute(loginDTO)).rejects.toThrow(UnauthorizedException);
        await expect(loginUserUseCase.execute(loginDTO)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
        const loginDTO = {
            email: 'john@example.com',
            password: 'password123',
        };

        const user = new User({
            name: 'John Doe',
            email: loginDTO.email,
            password: 'hashedPassword123',
            isActive: false,
        });

        mockUserRepository.findByEmail.mockResolvedValue(user);

        await expect(loginUserUseCase.execute(loginDTO)).rejects.toThrow(UnauthorizedException);
        await expect(loginUserUseCase.execute(loginDTO)).rejects.toThrow('User account is inactive');
    });
});
