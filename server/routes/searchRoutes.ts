import { Router } from 'express';
import { SearchController } from '../controllers/searchController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);
router.get('/', SearchController.search);

export default router;
