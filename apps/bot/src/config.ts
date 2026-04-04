import dotenv from 'dotenv';
dotenv.config();

if (!process.env.BOT_TOKEN) {
  throw new Error('BOT_TOKEN environment variable is required');
}

export const config = {
  botToken: process.env.BOT_TOKEN,
  apiUrl: process.env.API_URL || 'http://localhost:3001/api/v1',
  botApiKey: process.env.BOT_API_KEY || '',
  webAppUrl: process.env.WEB_APP_URL || 'https://app.osonprava.uz',
  registrationUrl: process.env.REGISTRATION_URL || 'https://osonprava.uz/uz',

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '2'),
  },

  botMode: (process.env.BOT_MODE || 'polling') as 'polling' | 'webhook',
  webhook: {
    domain: process.env.WEBHOOK_DOMAIN || '',
    path: process.env.WEBHOOK_PATH || '/bot/webhook',
    port: parseInt(process.env.WEBHOOK_PORT || '3002'),
    secret: process.env.WEBHOOK_SECRET || '',
  },

  adminIds: (process.env.ADMIN_IDS || '').split(',').map(Number).filter(Boolean),
  logLevel: process.env.LOG_LEVEL || 'info',
};
