export interface RegisterUserDTO {
    name: string;
    email: string;
    password: string;
}

export interface LoginUserDTO {
    email: string;
    password: string;
}

export interface UpdateUserDTO {
    name?: string;
    email?: string;
}

export interface UserResponseDTO {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface AuthResponseDTO {
    user: UserResponseDTO;
    accessToken: string;
    refreshToken: string;
}
