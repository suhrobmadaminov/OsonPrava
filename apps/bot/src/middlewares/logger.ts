import { NextFunction } from 'grammy';

export async function logger(ctx: any, next: NextFunction) {
  const start = Date.now();
  const user = ctx.from;
  const text = ctx.message?.text || ctx.callbackQuery?.data || '';

  await next();

  const ms = Date.now() - start;
  console.log(`[${new Date().toISOString()}] ${user?.id} (${user?.username || 'no-username'}): ${text} [${ms}ms]`);
}
