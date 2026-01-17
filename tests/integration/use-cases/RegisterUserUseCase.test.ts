import { RegisterUserUseCase } from '../../../../src/application/use-cases/auth/RegisterUserUseCase';
import { IUserRepository } from '../../../../src/domain/repositories/IUserRepository';
import { IPasswordHasher } from '../../../../src/domain/services/IPasswordHasher';
import { ITokenService } from '../../../../src/domain/services/ITokenService';
import { User } from '../../../../src/domain/entities/User';
import { ConflictException } from '../../../../src/domain/exceptions/DomainExceptions';

describe('RegisterUserUseCase', () => {
    let registerUserUseCase: RegisterUserUseCase;
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

        registerUserUseCase = new RegisterUserUseCase(
            mockUserRepository,
            mockPasswordHasher,
            mockTokenService
        );
    });

    it('should register a new user successfully', async () => {
        const registerDTO = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        };

        const hashedPassword = 'hashedPassword123';
        const accessToken = 'accessToken';
        const refreshToken = 'refreshToken';

        mockUserRepository.findByEmail.mockResolvedValue(null);
        mockPasswordHasher.hash.mockResolvedValue(hashedPassword);
        mockUserRepository.save.mockImplementation(async (user: User) => user);
        mockTokenService.generateAccessToken.mockReturnValue(accessToken);
        mockTokenService.generateRefreshToken.mockReturnValue(refreshToken);

        const result = await registerUserUseCase.execute(registerDTO);

        expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(registerDTO.email);
        expect(mockPasswordHasher.hash).toHaveBeenCalledWith(registerDTO.password);
        expect(mockUserRepository.save).toHaveBeenCalled();
        expect(mockTokenService.generateAccessToken).toHaveBeenCalled();
        expect(mockTokenService.generateRefreshToken).toHaveBeenCalled();

        expect(result).toHaveProperty('user');
        expect(result).toHaveProperty('accessToken', accessToken);
        expect(result).toHaveProperty('refreshToken', refreshToken);
        expect(result.user.name).toBe(registerDTO.name);
        expect(result.user.email).toBe(registerDTO.email);
    });

    it('should throw ConflictException when user already exists', async () => {
        const registerDTO = {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        };

        const existingUser = new User({
            name: 'Existing User',
            email: registerDTO.email,
            password: 'hashedPassword',
        });

        mockUserRepository.findByEmail.mockResolvedValue(existingUser);

        await expect(registerUserUseCase.execute(registerDTO)).rejects.toThrow(ConflictException);
        await expect(registerUserUseCase.execute(registerDTO)).rejects.toThrow(
            'User with this email already exists'
        );

        expect(mockPasswordHasher.hash).not.toHaveBeenCalled();
        expect(mockUserRepository.save).not.toHaveBeenCalled();
    });
});
