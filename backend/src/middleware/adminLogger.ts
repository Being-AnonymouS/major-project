import { Request, Response, NextFunction } from 'express';

export interface AdminAction {
  id: string;
  adminId: string;
  action: string;
  targetType: 'USER' | 'APPOINTMENT' | 'SYSTEM';
  targetId?: string;
  details: string;
  timestamp: Date;
}

// In-memory storage for admin actions (in production, this should be in database)
// We'll create a simple logging system since we don't have an AdminAction model in the schema
const adminActionLogs: AdminAction[] = [];

/**
 * Middleware to log admin actions
 */
export const logAdminAction = (action: string, targetType: 'USER' | 'APPOINTMENT' | 'SYSTEM') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Store original res.json to intercept response
    const originalJson = res.json;
    
    res.json = function (body: any) {
      // Only log if the action was successful (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const adminId = req.user?.userId;
        const targetId = req.params.id || req.params.userId || req.body.targetId;
        
        if (adminId) {
          const logEntry: AdminAction = {
            id: generateLogId(),
            adminId,
            action,
            targetType,
            targetId,
            details: generateActionDetails(action, req, body),
            timestamp: new Date(),
          };
          
          // Store in memory (in production, save to database)
          adminActionLogs.push(logEntry);
          
          // Keep only last 1000 entries to prevent memory issues
          if (adminActionLogs.length > 1000) {
            adminActionLogs.shift();
          }
          
          console.log(`[ADMIN ACTION] ${logEntry.adminId} performed ${action} on ${targetType} ${targetId || 'N/A'}`);
        }
      }
      
      // Call original json method
      return originalJson.call(this, body);
    };
    
    next();
  };
};

/**
 * Generate a simple ID for log entries
 */
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate detailed description of the admin action
 */
function generateActionDetails(action: string, req: Request, responseBody: any): string {
  const method = req.method;
  const path = req.path;
  const query = Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : '';
  const bodyKeys = req.body ? Object.keys(req.body) : [];
  
  let details = `${method} ${path}`;
  
  if (query) {
    details += ` with query: ${query}`;
  }
  
  if (bodyKeys.length > 0) {
    details += ` with body fields: [${bodyKeys.join(', ')}]`;
  }
  
  // Add specific action context
  switch (action) {
    case 'VIEW_USERS':
      const userCount = responseBody?.data?.users?.length || 0;
      details += ` - Retrieved ${userCount} users`;
      break;
    case 'VIEW_APPOINTMENTS':
      const appointmentCount = responseBody?.data?.appointments?.length || 0;
      details += ` - Retrieved ${appointmentCount} appointments`;
      break;
    case 'VIEW_STATS':
      details += ` - Retrieved platform statistics`;
      break;
    case 'UPDATE_USER_STATUS':
      const targetUserId = req.params.id || req.params.userId;
      details += ` - Updated status for user ${targetUserId}`;
      break;
    default:
      details += ` - ${action}`;
  }
  
  return details;
}

/**
 * Get admin action logs (for potential admin audit trail endpoint)
 */
export const getAdminActionLogs = (limit: number = 100): AdminAction[] => {
  return adminActionLogs
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

/**
 * Get admin action logs for a specific admin
 */
export const getAdminActionLogsByAdmin = (adminId: string, limit: number = 100): AdminAction[] => {
  return adminActionLogs
    .filter(log => log.adminId === adminId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, limit);
};

/**
 * Clear old admin action logs (cleanup utility)
 */
export const clearOldAdminLogs = (daysOld: number = 30): number => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const initialLength = adminActionLogs.length;
  
  // Remove logs older than cutoff date
  for (let i = adminActionLogs.length - 1; i >= 0; i--) {
    if (adminActionLogs[i].timestamp < cutoffDate) {
      adminActionLogs.splice(i, 1);
    }
  }
  
  const removedCount = initialLength - adminActionLogs.length;
  console.log(`[ADMIN LOGGER] Cleaned up ${removedCount} old admin action logs`);
  
  return removedCount;
};