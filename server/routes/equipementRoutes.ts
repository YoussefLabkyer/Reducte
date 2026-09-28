import { Router } from 'express';
import { EquipementController } from '../controllers/equipementController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';
import { validateRequiredFields } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', EquipementController.getAll);
router.get('/:id', EquipementController.getById);

// Admin & Client can create/edit equipment
router.post(
  '/',
  validateRequiredFields(['nom', 'categorie', 'marque', 'modele']),
  EquipementController.create
);

router.put('/:id', requireRoles('admin', 'technicien'), EquipementController.update);
router.delete('/:id', requireRoles('admin', 'client'), EquipementController.delete);

export default router;
