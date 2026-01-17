import { IUserRepository } from '@domain/repositories/IUserRepository';
import { UserResponseDTO } from '@application/dtos/UserDTO';
import { NotFoundException } from '@domain/exceptions/DomainExceptions';

export class GetUserByIdUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(id: string): Promise<UserResponseDTO> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
