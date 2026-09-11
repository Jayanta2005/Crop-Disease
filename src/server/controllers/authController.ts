import { Request, Response, NextFunction } from 'express';
import { repository } from '../data/repository';
import { sendSuccess, sendError } from '../utils/response';
import { DEMO_USERS } from '../../data/mockData';

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { role } = req.body;
      const targetUser = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
      await repository.setCurrentUser(targetUser);

      return sendSuccess(res, targetUser, `Logged in as ${targetUser.name} (${targetUser.role})`, 200, {
        user: targetUser
      });
    } catch (err: any) {
      return sendError(res, 'Login failed', 500, err);
    }
  },

  getCurrentUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await repository.getCurrentUser();
      return sendSuccess(res, user, 'Current session retrieved', 200, {
        user
      });
    } catch (err: any) {
      return sendError(res, 'Failed to get current user', 500, err);
    }
  },

  getFarmerProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await repository.getCurrentUser();
      const farms = await repository.getFarms(user.id);

      return sendSuccess(res, { user, farms }, 'Farmer profile retrieved', 200, {
        user,
        farms
      });
    } catch (err: any) {
      return sendError(res, 'Failed to get farmer profile', 500, err);
    }
  },

  getFarms: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await repository.getCurrentUser();
      const farms = await repository.getFarms(user.role === 'FARMER' ? user.id : undefined);

      return sendSuccess(res, farms, 'Farms retrieved', 200, {
        farms
      });
    } catch (err: any) {
      return sendError(res, 'Failed to get farms', 500, err);
    }
  },

  getCrops: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const crops = await repository.getCrops();
      return sendSuccess(res, crops, 'Supported crops retrieved', 200, {
        crops
      });
    } catch (err: any) {
      return sendError(res, 'Failed to get supported crops', 500, err);
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, phone, village, district, state } = req.body;
      const currentUser = await repository.getCurrentUser();
      const updatedUser = {
        ...currentUser,
        ...(name && { name: String(name).trim() }),
        ...(phone && { phone: String(phone).trim(), id: String(phone).trim() }),
        ...(village !== undefined && { village: String(village).trim() }),
        ...(district !== undefined && { district: String(district).trim() }),
        ...(state !== undefined && { state: String(state).trim() })
      };
      await repository.setCurrentUser(updatedUser);
      return sendSuccess(res, updatedUser, 'Profile updated successfully', 200, {
        user: updatedUser
      });
    } catch (err: any) {
      return sendError(res, 'Failed to update profile', 500, err);
    }
  }
};
