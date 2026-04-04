import { Bot } from 'grammy';
import { MyContext } from '../types';
import { getPremiumKeyboard } from '../keyboards/inlineKeyboard';

const premiumMessages: Record<string, string> = {
  uz: `👑 <b>OsonPrava Premium</b>

Premium imkoniyatlar:
🧠 Aqlli test (SM-2 algoritmi)
🔊 Audio tushuntirishlar
🚫 Reklama yo'q
🏅 Maxsus badgelar
⚡ Prioritet qo'llab-quvvatlash

Tarifni tanlang:`,

  ru: `👑 <b>OsonPrava Premium</b>

Премиум возможности:
🧠 Умный тест (алгоритм SM-2)
🔊 Аудио объяснения
🚫 Без рекламы
🏅 Специальные бейджи
⚡ Приоритетная поддержка

Выберите тариф:`,

  kr: `👑 <b>ОсонПрава Премиум</b>

Премиум имкониятлар:
🧠 Ақлли тест (SM-2 алгоритми)
🔊 Аудио тушунтиришлар
🚫 Реклама йўқ
🏅 Махсус бадгелар
⚡ Приоритет қўллаб-қувватлаш

Тарифни танланг:`,
};

export function setupPremiumCommand(bot: Bot<MyContext>) {
  bot.command('premium', async (ctx) => {
    const lang = ctx.session.language || 'uz';
    await ctx.reply(premiumMessages[lang] || premiumMessages.uz, {
      parse_mode: 'HTML',
      reply_markup: getPremiumKeyboard(lang),
    });
  });
}
