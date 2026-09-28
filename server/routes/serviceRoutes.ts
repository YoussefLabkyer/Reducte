import { Router } from 'express';
import { ServiceController } from '../controllers/serviceController.js';
import { authenticateToken, requireRoles } from '../middleware/authMiddleware.js';
import { validateRequiredFields } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);

// Admin only can assign technician
router.put(
  '/:id/assign',
  requireRoles('admin'),
  validateRequiredFields(['technicienId']),
  ServiceController.assign
);

// Admin & Technicians can update status
router.put(
  '/:id/status',
  requireRoles('admin', 'technicien'),
  validateRequiredFields(['statut']),
  ServiceController.updateStatus
);

// Admin can delete service intervention
router.delete('/:id', requireRoles('admin'), ServiceController.delete);

export default router;
