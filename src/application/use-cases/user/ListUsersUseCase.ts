import { IUserRepository, UserListParams } from '@domain/repositories/IUserRepository';
import { UserResponseDTO } from '@application/dtos/UserDTO';
import { PaginatedResponse } from '@application/dtos/CommonDTOs';

export class ListUsersUseCase {
    constructor(private readonly userRepository: IUserRepository) { }

    async execute(params: UserListParams): Promise<PaginatedResponse<UserResponseDTO>> {
        const [users, total] = await this.userRepository.findAll(params);

        const page = params.page || 1;
        const limit = params.limit || 10;

        const totalPages = Math.ceil(total / limit);

        return {
            data: users.map((user) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                isActive: user.isActive,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            })),
            meta: {
                totalItems: total,
                itemCount: users.length,
                itemsPerPage: limit,
                totalPages: totalPages,
                currentPage: page,
                hasNext: page < totalPages,
                hasPrevious: page > 1,
            },
        };
    }
}
