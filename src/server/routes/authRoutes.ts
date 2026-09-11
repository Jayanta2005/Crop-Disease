import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authController.getCurrentUser);
router.post('/profile', authController.updateProfile);
router.put('/profile', authController.updateProfile);

export default router;
