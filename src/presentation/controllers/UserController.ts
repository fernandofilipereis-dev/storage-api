import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middlewares/AuthMiddleware';
import { GetUserByIdUseCase } from '@application/use-cases/user/GetUserByIdUseCase';
import { UpdateUserUseCase } from '@application/use-cases/user/UpdateUserUseCase';
import { ListUsersUseCase } from '@application/use-cases/user/ListUsersUseCase';
import { UserRepository } from '@infrastructure/database/repositories/UserRepository';

export class UserController {
    private getUserByIdUseCase: GetUserByIdUseCase;
    private updateUserUseCase: UpdateUserUseCase;
    private listUsersUseCase: ListUsersUseCase;

    constructor() {
        const userRepository = new UserRepository();

        this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
        this.updateUserUseCase = new UpdateUserUseCase(userRepository);
        this.listUsersUseCase = new ListUsersUseCase(userRepository);
    }

    /**
     * @swagger
     * /users:
     *   get:
     *     summary: List users with pagination, sorting, and filtering
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *         description: Page number
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *         description: Items per page
     *       - in: query
     *         name: sortBy
     *         schema:
     *           type: string
     *           default: createdAt
     *         description: Field to sort by
     *       - in: query
     *         name: sortOrder
     *         schema:
     *           type: string
     *           enum: [ASC, DESC]
     *           default: DESC
     *         description: Sort order
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term (name or email)
     *       - in: query
     *         name: isActive
     *         schema:
     *           type: boolean
     *         description: Filter by active status
     *     responses:
     *       200:
     *         description: List of users retrieved successfully
     *       401:
     *         description: Unauthorized
     */
    listUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { page, limit, sortBy, sortOrder, search, isActive } = req.query;

            // Parse and validate pagination
            let pageNum = page ? parseInt(page as string, 10) : 1;
            let limitNum = limit ? parseInt(limit as string, 10) : 10;

            // Prevent negative or zero values and cap the limit to avoid performance issues or overflows
            pageNum = Math.max(1, Math.min(pageNum, 1000000)); // Cap page at a reasonable large number
            limitNum = Math.max(1, Math.min(limitNum, 100));   // Cap limit at 100

            const params = {
                page: pageNum,
                limit: limitNum,
                sortBy: sortBy as string || 'createdAt',
                sortOrder: (sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' as 'ASC' | 'DESC',
                search: search as string,
                isActive: isActive !== undefined ? isActive === 'true' : undefined,
            };

            const result = await this.listUsersUseCase.execute(params);

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /users/me:
     *   get:
     *     summary: Get current user profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const user = await this.getUserByIdUseCase.execute(userId);

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /users/me:
     *   put:
     *     summary: Update current user profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: John Doe Updated
     *               email:
     *                 type: string
     *                 format: email
     *                 example: john.updated@example.com
     *     responses:
     *       200:
     *         description: User updated successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     *       409:
     *         description: Email already in use
     */
    updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const { name, email } = req.body;

            const updatedUser = await this.updateUserUseCase.execute(userId, { name, email });

            res.status(200).json(updatedUser);
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Get user by ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *         description: User ID
     *     responses:
     *       200:
     *         description: User retrieved successfully
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: User not found
     */
    getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const id = req.params.id as string;

            const user = await this.getUserByIdUseCase.execute(id);

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    };
}
