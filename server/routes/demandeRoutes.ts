import { Router } from 'express';
import { DemandeController } from '../controllers/demandeController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';
import { validateRequiredFields } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', DemandeController.getAll);
router.get('/:id', DemandeController.getById);

router.post(
  '/',
  requireRoles('admin', 'client'),
  validateRequiredFields(['objet', 'description', 'equipementId']),
  DemandeController.create
);

router.put('/:id', requireRoles('admin', 'technicien'), DemandeController.update);
router.post('/:id/cancel', requireRoles('admin', 'technicien', 'client'), DemandeController.cancel);
router.delete('/:id', requireRoles('admin', 'client'), DemandeController.delete);

export default router;
