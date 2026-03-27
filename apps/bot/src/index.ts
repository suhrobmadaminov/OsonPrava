import express from 'express';
import { webhookCallback } from 'grammy';
import { bot } from './bot';
import { config } from './config';

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

async function start() {
  console.log('🤖 EasyPrava Bot starting...');

  // Set bot commands
  await bot.api.setMyCommands([
    { command: 'start', description: 'Botni ishga tushirish' },
    { command: 'help', description: 'Yordam' },
  ]);

  if (config.botMode === 'webhook') {
    // Webhook mode (production)
    const app = express();
    app.use(express.json());

    app.post(config.webhook.path, webhookCallback(bot, 'express'));

    app.get('/health', (_req, res) => res.json({ status: 'ok' }));

    app.listen(config.webhook.port, () => {
      console.log(`🌐 Webhook server running on port ${config.webhook.port}`);
    });

    await bot.api.setWebhook(`${config.webhook.domain}${config.webhook.path}`, {
      secret_token: config.webhook.secret,
    });
    console.log(`✅ Webhook set: ${config.webhook.domain}${config.webhook.path}`);
  } else {
    // Long polling mode (development)
    await bot.api.deleteWebhook({ drop_pending_updates: true });
    bot.start({
      drop_pending_updates: true,
      onStart: () => console.log('✅ Bot started in polling mode'),
    });
  }
}

start().catch((err) => {
  console.error('❌ Failed to start bot:', err);
  process.exit(1);
});
