import { Bot } from 'grammy';
import { apiService } from '../services/apiService';

export async function showStats(ctx: any) {
  const lang = ctx.session.language || 'uz';

  try {
    if (!ctx.session.token) {
      const msgs: Record<string, string> = {
        uz: '⚠️ Statistika hozircha mavjud emas. Server ulanmagan.\n\n📱 To\'liq statistika uchun ilovaga o\'ting: app.osonprava.uz',
        ru: '⚠️ Статистика пока недоступна. Сервер не подключён.\n\n📱 Полная статистика в приложении: app.osonprava.uz',
        kr: '⚠️ Статистика ҳозирча мавжуд эмас. Сервер уланмаган.\n\n📱 Тўлиқ статистика учун иловага ўтинг: app.osonprava.uz',
      };
      await ctx.reply(msgs[lang] || msgs.uz);
      return;
    }

    const stats = await apiService.getUserStats(ctx.session.token);

    const messages: Record<string, string> = {
      uz: `📊 <b>Sizning statistikangiz:</b>

✅ To'g'ri javoblar: <b>${stats.totalCorrect || 0}</b>
❌ Noto'g'ri javoblar: <b>${stats.totalWrong || 0}</b>
📈 O'rganilganlik: <b>${stats.progressPercent || 0}%</b>
🔥 Streak: <b>${stats.streak || 0}</b> kun
⏱ Umumiy vaqt: <b>${Math.floor((stats.totalTimeSec || 0) / 60)}</b> daqiqa

Davom eting! 💪`,

      ru: `📊 <b>Ваша статистика:</b>

✅ Правильных: <b>${stats.totalCorrect || 0}</b>
❌ Неправильных: <b>${stats.totalWrong || 0}</b>
📈 Изучено: <b>${stats.progressPercent || 0}%</b>
🔥 Серия: <b>${stats.streak || 0}</b> дней
⏱ Общее время: <b>${Math.floor((stats.totalTimeSec || 0) / 60)}</b> мин

Продолжайте! 💪`,

      kr: `📊 <b>Сизнинг статистикангиз:</b>

✅ Тўғри жавоблар: <b>${stats.totalCorrect || 0}</b>
❌ Нотўғри жавоблар: <b>${stats.totalWrong || 0}</b>
📈 Ўрганилганлик: <b>${stats.progressPercent || 0}%</b>
🔥 Streak: <b>${stats.streak || 0}</b> кун
⏱ Умумий вақт: <b>${Math.floor((stats.totalTimeSec || 0) / 60)}</b> дақиқа

Давом этинг! 💪`,
    };

    await ctx.reply(messages[lang] || messages.uz, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('Stats error:', err);
    await ctx.reply('❌ Statistikani yuklashda xatolik.');
  }
}

export function setupStatsCommand(bot: Bot) {
  bot.command('stats', async (ctx) => {
    await showStats(ctx);
  });
}
