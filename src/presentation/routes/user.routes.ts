import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

// All user routes require authentication
router.use(authMiddleware.authenticate);

router.get('/me', userController.getProfile);
router.put('/me', userController.updateProfile);
router.get('/:id', userController.getUserById);

export default router;
