import { User } from '../../../../src/domain/entities/User';

describe('User Entity', () => {
    describe('Constructor', () => {
        it('should create a user with valid data', () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword123',
            };

            const user = new User(userData);

            expect(user.name).toBe(userData.name);
            expect(user.email).toBe(userData.email);
            expect(user.password).toBe(userData.password);
            expect(user.isActive).toBe(true);
            expect(user.id).toBeDefined();
            expect(user.createdAt).toBeInstanceOf(Date);
            expect(user.updatedAt).toBeInstanceOf(Date);
        });

        it('should throw error when name is empty', () => {
            const userData = {
                name: '',
                email: 'john@example.com',
                password: 'hashedPassword123',
            };

            expect(() => new User(userData)).toThrow('Name is required');
        });

        it('should throw error when name is too short', () => {
            const userData = {
                name: 'J',
                email: 'john@example.com',
                password: 'hashedPassword123',
            };

            expect(() => new User(userData)).toThrow('Name must be at least 2 characters long');
        });

        it('should throw error when email is empty', () => {
            const userData = {
                name: 'John Doe',
                email: '',
                password: 'hashedPassword123',
            };

            expect(() => new User(userData)).toThrow('Email is required');
        });

        it('should throw error when password is empty', () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: '',
            };

            expect(() => new User(userData)).toThrow('Password is required');
        });
    });

    describe('Business Methods', () => {
        let user: User;

        beforeEach(() => {
            user = new User({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'hashedPassword123',
            });
        });

        it('should update name successfully', () => {
            const newName = 'Jane Doe';
            const oldUpdatedAt = user.updatedAt;

            user.updateName(newName);

            expect(user.name).toBe(newName);
            expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
        });

        it('should throw error when updating with empty name', () => {
            expect(() => user.updateName('')).toThrow('Name is required');
        });

        it('should update email successfully', () => {
            const newEmail = 'jane@example.com';
            const oldUpdatedAt = user.updatedAt;

            user.updateEmail(newEmail);

            expect(user.email).toBe(newEmail);
            expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
        });

        it('should update password successfully', () => {
            const newPassword = 'newHashedPassword456';
            const oldUpdatedAt = user.updatedAt;

            user.updatePassword(newPassword);

            expect(user.password).toBe(newPassword);
            expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
        });

        it('should activate user', () => {
            user.deactivate();
            expect(user.isActive).toBe(false);

            user.activate();
            expect(user.isActive).toBe(true);
        });

        it('should deactivate user', () => {
            expect(user.isActive).toBe(true);

            user.deactivate();
            expect(user.isActive).toBe(false);
        });

        it('should convert to JSON without password', () => {
            const json = user.toJSON();

            expect(json).toHaveProperty('id');
            expect(json).toHaveProperty('name');
            expect(json).toHaveProperty('email');
            expect(json).toHaveProperty('isActive');
            expect(json).toHaveProperty('createdAt');
            expect(json).toHaveProperty('updatedAt');
            expect(json).not.toHaveProperty('password');
        });
    });
});
