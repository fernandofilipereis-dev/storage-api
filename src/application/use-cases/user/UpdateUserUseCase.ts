import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UpdateUserDTO, UserResponseDTO } from '@application/dtos/UserDTO';
import { NotFoundException, ConflictException } from '@domain/exceptions/DomainExceptions';

export class UpdateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(id: string, dto: UpdateUserDTO): Promise<UserResponseDTO> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Check if email is being updated and if it's already in use
        if (dto.email && dto.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(dto.email);
            if (existingUser) {
                throw new ConflictException('Email already in use');
            }
            user.updateEmail(dto.email);
        }

        // Update name if provided
        if (dto.name) {
            user.updateName(dto.name);
        }

        const updatedUser = await this.userRepository.update(user);

        return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            isActive: updatedUser.isActive,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
        };
    }
}
