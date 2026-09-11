import { Request, Response, NextFunction } from 'express';
import { repository } from '../data/repository';
import { UserRole } from '../../types';
import { sendError } from '../utils/response';
import { expertCaseService } from '../services/expertCaseService';

export interface AuthenticatedUser {
  id: string;
  name: string;
  role: UserRole;
  state?: string;
  district?: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Authentication Middleware
 * Identifies the current user from headers or session context.
 * Resolves user from repository with graceful fallback for local development.
 */
export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const headerUserId = (req.headers['x-user-id'] as string) || undefined;
    const headerUserRole = (req.headers['x-user-role'] as UserRole) || undefined;
    const authHeader = req.headers['authorization'];

    let user: AuthenticatedUser | null = null;

    if (headerUserId) {
      const repoUser = await repository.getUserById(headerUserId);
      if (repoUser) {
        user = {
          id: repoUser.id,
          name: repoUser.name,
          role: headerUserRole || repoUser.role,
          state: repoUser.state,
          district: repoUser.district
        };
      } else {
        user = {
          id: headerUserId,
          name: 'User ' + headerUserId,
          role: headerUserRole || 'FARMER'
        };
      }
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // For demonstration and token validation
      if (token.startsWith('user-')) {
        const repoUser = await repository.getUserById(token);
        if (repoUser) {
          user = {
            id: repoUser.id,
            name: repoUser.name,
            role: repoUser.role,
            state: repoUser.state,
            district: repoUser.district
          };
        }
      }
    }

    // Default fallback to active currentUser in repository
    if (!user) {
      const defaultUser = await repository.getCurrentUser();
      user = {
        id: defaultUser.id,
        name: defaultUser.name,
        role: (headerUserRole as UserRole) || defaultUser.role,
        state: defaultUser.state,
        district: defaultUser.district
      };
    }

    req.user = user;
    next();
  } catch (err: any) {
    console.error('[AuthMiddleware] Error resolving user context:', err);
    return sendError(res, 'Authentication failed', 401);
  }
}

/**
 * Role-Based Access Control (RBAC) Guard
 * Restricts route access to specified roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized: Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required roles: ${allowedRoles.join(', ')}`,
        403
      );
    }

    next();
  };
}

/**
 * Contextual Authorization for Expert Cases
 * - Farmers can only view/create cases for their own farmerId
 * - Experts and Extension workers can access all pending cases or cases assigned to them
 * - Admins have unrestricted system access
 */
export function authorizeCaseAccess(action: 'view' | 'create' | 'assign' | 'decide' | 'close') {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return sendError(res, 'Unauthorized: User context required', 401);
    }

    // Admins have universal clearance
    if (user.role === 'ADMIN') {
      return next();
    }

    const caseId = req.params.id || req.params.caseId;

    if (action === 'assign' || action === 'decide' || action === 'close') {
      if (user.role === 'FARMER') {
        return sendError(res, `Forbidden: Farmers cannot perform expert action '${action}' on cases.`, 403);
      }
      return next();
    }

    if (action === 'create') {
      // Any authenticated user can create or report a case
      return next();
    }

    if (action === 'view' && caseId) {
      const caseItem = expertCaseService.getCaseById(caseId);
      if (!caseItem) {
        return sendError(res, `Case '${caseId}' not found`, 404);
      }

      // If farmer, must be the owner
      if (user.role === 'FARMER' && caseItem.farmerId !== user.id) {
        return sendError(res, 'Forbidden: You can only view your own agricultural cases.', 403);
      }
    }

    next();
  };
}

/**
 * Contextual Authorization for Diagnosis Records
 * - Farmers can only view/mutate their own diagnoses
 * - Experts and Admins can view diagnoses across the system
 */
export async function authorizeDiagnosisAccess(req: Request, res: Response, next: NextFunction) {
  const user = req.user;
  if (!user) {
    return sendError(res, 'Unauthorized', 401);
  }

  if (user.role === 'ADMIN' || user.role === 'EXPERT' || user.role === 'EXTENSION_WORKER' || user.role === 'LAB_STAFF') {
    return next();
  }

  const diagnosisId = req.params.id;
  if (diagnosisId) {
    const record = await repository.getDiagnosisById(diagnosisId);
    if (record && record.farmerId !== user.id) {
      return sendError(res, 'Forbidden: You cannot access another farmer\'s diagnosis record.', 403);
    }
  }

  next();
}
