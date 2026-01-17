import { Response } from 'express';
import { AuthRequest } from '../middlewares/AuthMiddleware';
import { GetUserByIdUseCase } from '../../application/use-cases/user/GetUserByIdUseCase';
import { UpdateUserUseCase } from '../../application/use-cases/user/UpdateUserUseCase';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';

export class UserController {
    private getUserByIdUseCase: GetUserByIdUseCase;
    private updateUserUseCase: UpdateUserUseCase;

    constructor() {
        const userRepository = new UserRepository();

        this.getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
        this.updateUserUseCase = new UpdateUserUseCase(userRepository);
    }

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
    getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const user = await this.getUserByIdUseCase.execute(userId);

            res.status(200).json(user);
        } catch (error) {
            throw error;
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
    updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
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
            throw error;
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
    getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const user = await this.getUserByIdUseCase.execute(id);

            res.status(200).json(user);
        } catch (error) {
            throw error;
        }
    };
}
