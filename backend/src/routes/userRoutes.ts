import { Router } from 'express';
import { userController } from '../controllers/userController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateSettingsSchema,
} from '../validators/userValidators';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/me', userController.getProfile);
router.patch('/me', validateRequest({ body: updateProfileSchema }), userController.updateProfile);
router.post('/me/change-password', validateRequest({ body: changePasswordSchema }), userController.changePassword);
router.patch('/me/settings', validateRequest({ body: updateSettingsSchema }), userController.updateSettings);

router.get('/me/devices', userController.listDevices);
router.delete('/me/devices/:id', userController.removeDevice);
router.delete('/me', userController.deleteAccount);

export default router;

