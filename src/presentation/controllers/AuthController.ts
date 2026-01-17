import { Request, Response, NextFunction } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/auth/RegisterUserUseCase';
import { LoginUserUseCase } from '../../application/use-cases/auth/LoginUserUseCase';
import { UserRepository } from '../../infrastructure/database/repositories/UserRepository';
import { BcryptService } from '../../infrastructure/security/BcryptService';
import { JwtService } from '../../infrastructure/security/JwtService';

export class AuthController {
    private registerUserUseCase: RegisterUserUseCase;
    private loginUserUseCase: LoginUserUseCase;

    constructor() {
        const userRepository = new UserRepository();
        const passwordHasher = new BcryptService();
        const tokenService = new JwtService();

        this.registerUserUseCase = new RegisterUserUseCase(
            userRepository,
            passwordHasher,
            tokenService
        );

        this.loginUserUseCase = new LoginUserUseCase(
            userRepository,
            passwordHasher,
            tokenService
        );
    }

    /**
     * @swagger
     * /auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - name
     *               - email
     *               - password
     *             properties:
     *               name:
     *                 type: string
     *                 example: John Doe
     *               email:
     *                 type: string
     *                 format: email
     *                 example: john@example.com
     *               password:
     *                 type: string
     *                 format: password
     *                 example: SecurePass123!
     *     responses:
     *       201:
     *         description: User registered successfully
     *       400:
     *         description: Validation error
     *       409:
     *         description: User already exists
     */
    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                res.status(400).json({ error: 'Name, email, and password are required' });
                return;
            }

            const result = await this.registerUserUseCase.execute({ name, email, password });

            res.status(201).json(result);
        } catch (error) {
            next(error);
        }
    };

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Login user
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 example: john@example.com
     *               password:
     *                 type: string
     *                 format: password
     *                 example: SecurePass123!
     *     responses:
     *       200:
     *         description: Login successful
     *       401:
     *         description: Invalid credentials
     *       404:
     *         description: User not found
     */
    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }

            const result = await this.loginUserUseCase.execute({ email, password });

            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    };
}
