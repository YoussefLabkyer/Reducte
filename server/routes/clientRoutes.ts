import { Router } from 'express';
import { ClientController } from '../controllers/clientController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';
import { validateRequiredFields } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(authenticateToken);

// All authenticated users can view clients list / client details (for dropdowns/context)
router.get('/', ClientController.getAll);
router.get('/:id', ClientController.getById);
router.get('/:id/equipements', ClientController.getEquipements);

// Admin only operations
router.post(
  '/',
  requireRoles('admin'),
  validateRequiredFields(['nom', 'prenom', 'societe', 'email']),
  ClientController.create
);

router.put('/:id', requireRoles('admin'), ClientController.update);
router.delete('/:id', requireRoles('admin'), ClientController.delete);

export default router;
