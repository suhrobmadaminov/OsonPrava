import { Bot } from 'grammy';
import { MyContext } from '../types';
import { getLanguageKeyboard } from '../keyboards/inlineKeyboard';

export async function showSettings(ctx: any) {
  const lang = ctx.session.language || 'uz';

  const messages: Record<string, string> = {
    uz: '⚙️ <b>Sozlamalar</b>\n\nTilni tanlang:',
    ru: '⚙️ <b>Настройки</b>\n\nВыберите язык:',
    kr: '⚙️ <b>Созламалар</b>\n\nТилни танланг:',
  };

  await ctx.reply(messages[lang] || messages.uz, {
    parse_mode: 'HTML',
    reply_markup: getLanguageKeyboard(),
  });
}

export function setupSettingsCommand(bot: Bot<MyContext>) {
  bot.command('settings', async (ctx) => {
    await showSettings(ctx);
  });
}
