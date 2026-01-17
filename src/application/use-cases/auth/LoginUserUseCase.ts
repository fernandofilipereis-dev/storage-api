import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IPasswordHasher } from '@domain/services/IPasswordHasher';
import { ITokenService } from '@domain/services/ITokenService';
import { LoginUserDTO, AuthResponseDTO } from '@application/dtos/UserDTO';
import { UnauthorizedException, NotFoundException } from '@domain/exceptions/DomainExceptions';

export class LoginUserUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordHasher: IPasswordHasher,
        private readonly tokenService: ITokenService
    ) { }

    async execute(dto: LoginUserDTO): Promise<AuthResponseDTO> {
        // Find user by email
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('User account is inactive');
        }

        // Verify password
        const isPasswordValid = await this.passwordHasher.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const accessToken = this.tokenService.generateAccessToken({
            userId: user.id,
            email: user.email,
        });

        const refreshToken = this.tokenService.generateRefreshToken({
            userId: user.id,
        });

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            accessToken,
            refreshToken,
        };
    }
}
