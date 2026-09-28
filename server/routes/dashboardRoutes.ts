import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/stats', DashboardController.getStats);

export default router;
