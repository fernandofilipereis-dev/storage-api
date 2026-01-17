import { User } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IPasswordHasher } from '../../domain/services/IPasswordHasher';
import { ITokenService } from '../../domain/services/ITokenService';
import { RegisterUserDTO, AuthResponseDTO } from '../dtos/UserDTO';
import { ConflictException } from '../../domain/exceptions/DomainExceptions';

export class RegisterUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService
    ) { }

    async execute(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
        // Check if user already exists
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await this.passwordHasher.hash(dto.password);

        // Create user entity
        const user = new User({
            name: dto.name,
            email: dto.email,
            password: hashedPassword,
        });

        // Save user
        const savedUser = await this.userRepository.save(user);

        // Generate tokens
        const accessToken = this.tokenService.generateAccessToken({
            userId: savedUser.id,
            email: savedUser.email,
        });

        const refreshToken = this.tokenService.generateRefreshToken({
            userId: savedUser.id,
        });

        return {
            user: {
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
                isActive: savedUser.isActive,
                createdAt: savedUser.createdAt,
                updatedAt: savedUser.updatedAt,
            },
            accessToken,
            refreshToken,
        };
    }
}
