import { NextFunction } from 'grammy';
import { apiService } from '../services/apiService';

export async function authMiddleware(ctx: any, next: NextFunction) {
  if (!ctx.from) return next();

  // If no token in session, register/login via API
  if (!ctx.session.token) {
    try {
      const result = await apiService.loginUser({
        id: ctx.from.id,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        username: ctx.from.username,
        language_code: ctx.from.language_code,
      });
      ctx.session.token = result.accessToken;
    } catch (err) {
      // API not available — continue without token (offline mode)
      console.warn('Auth skipped for user', ctx.from.id, '(API unavailable)');
    }
  }

  return next();
}
