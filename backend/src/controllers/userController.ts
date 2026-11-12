import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { userService } from '../services/userService';
import { sendSuccess, sendNoContent } from '../utils/response';
import { UnauthorizedError } from '../utils/errors';

export class UserController {
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const profile = await userService.getProfile(req.user.id);
      sendSuccess(res, profile, 'Profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const updated = await userService.updateProfile(req.user.id, req.body, req.ip);
      sendSuccess(res, updated, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await userService.changePassword(req.user.id, req.body, req.ip);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const settings = await userService.updateSettings(req.user.id, req.body);
      sendSuccess(res, settings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async listDevices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const devices = await userService.listDevices(req.user.id);
      sendSuccess(res, devices, 'Devices retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async removeDevice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      const { id } = req.params;
      await userService.removeDevice(req.user.id, id);
      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new UnauthorizedError();
      await userService.deleteAccount(req.user.id, req.ip);
      sendSuccess(res, null, 'Account deleted permanently');
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();

