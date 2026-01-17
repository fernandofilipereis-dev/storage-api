import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authRateLimitMiddleware } from '../middlewares/RateLimitMiddleware';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

router.post('/register', authRateLimitMiddleware, authController.register);
router.post('/login', authRateLimitMiddleware, authController.login);

export default router;
