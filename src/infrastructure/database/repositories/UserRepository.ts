import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { UserEntity } from '../entities/UserEntity';
import { AppDataSource } from '../config/ormconfig';

export class UserRepository implements IUserRepository {
    private repository: Repository<UserEntity>;

    constructor() {
        this.repository = AppDataSource.getRepository(UserEntity);
    }

    async findById(id: string): Promise<User | null> {
        const entity = await this.repository.findOne({ where: { id } });
        return entity ? this.toDomain(entity) : null;
    }

    async findByEmail(email: string): Promise<User | null> {
        const entity = await this.repository.findOne({ where: { email } });
        return entity ? this.toDomain(entity) : null;
    }

    async findAll(params?: any): Promise<[User[], number]> {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search, isActive } = params || {};

        const queryBuilder = this.repository.createQueryBuilder('user');

        if (search) {
            queryBuilder.andWhere('(user.name LIKE :search OR user.email LIKE :search)', {
                search: `%${search}%`,
            });
        }

        if (isActive !== undefined) {
            queryBuilder.andWhere('user.isActive = :isActive', { isActive });
        }

        queryBuilder.orderBy(`user.${sortBy}`, sortOrder);
        queryBuilder.skip((page - 1) * limit);
        queryBuilder.take(limit);

        const [entities, count] = await queryBuilder.getManyAndCount();
        return [entities.map((entity) => this.toDomain(entity)), count];
    }

    async save(user: User): Promise<User> {
        const entity = this.toEntity(user);
        const savedEntity = await this.repository.save(entity);
        return this.toDomain(savedEntity);
    }

    async update(user: User): Promise<User> {
        const entity = this.toEntity(user);
        const updatedEntity = await this.repository.save(entity);
        return this.toDomain(updatedEntity);
    }

    async delete(id: string): Promise<void> {
        await this.repository.delete(id);
    }

    async exists(email: string): Promise<boolean> {
        const count = await this.repository.count({ where: { email } });
        return count > 0;
    }

    private toDomain(entity: UserEntity): User {
        return new User({
            id: entity.id,
            name: entity.name,
            email: entity.email,
            password: entity.password,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }

    private toEntity(user: User): UserEntity {
        const entity = new UserEntity();
        entity.id = user.id;
        entity.name = user.name;
        entity.email = user.email;
        entity.password = user.password;
        entity.isActive = user.isActive;
        entity.createdAt = user.createdAt;
        entity.updatedAt = user.updatedAt;
        return entity;
    }
}
