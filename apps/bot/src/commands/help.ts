import { Bot } from 'grammy';

const helpMessages: Record<string, string> = {
  uz: `❓ <b>Yordam</b>

Mavjud buyruqlar:

/start — Botni ishga tushirish
/test — Tezkor test (5 ta savol)
/tickets — Biletlar ro'yxati
/stats — Sizning statistikangiz
/settings — Til sozlamalari
/premium — Premium obuna
/help — Shu xabar

📱 To'liq versiya uchun <b>Ilovaga o'tish</b> tugmasini bosing.

Savollar uchun: @EasyPrava_bot`,

  ru: `❓ <b>Помощь</b>

Доступные команды:

/start — Запустить бота
/test — Быстрый тест (5 вопросов)
/tickets — Список билетов
/stats — Ваша статистика
/settings — Настройки языка
/premium — Премиум подписка
/help — Это сообщение

📱 Для полной версии нажмите <b>Перейти в приложение</b>.

Вопросы: @EasyPrava_bot`,

  kr: `❓ <b>Ёрдам</b>

Мавжуд буйруқлар:

/start — Ботни ишга тушириш
/test — Тезкор тест (5 та савол)
/tickets — Билетлар рўйхати
/stats — Сизнинг статистикангиз
/settings — Тил созламалари
/premium — Премиум обуна
/help — Шу хабар

📱 Тўлиқ версия учун <b>Иловага ўтиш</b> тугмасини босинг.

Саволлар учун: @EasyPrava_bot`,
};

export function setupHelpCommand(bot: Bot) {
  bot.command('help', async (ctx) => {
    const lang = ctx.session.language || 'uz';
    await ctx.reply(helpMessages[lang] || helpMessages.uz, { parse_mode: 'HTML' });
  });
}
