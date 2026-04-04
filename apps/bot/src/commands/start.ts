import { Bot } from 'grammy';
import { MyContext } from '../types';
import { getMainKeyboard } from '../keyboards/mainKeyboard';
import { getLanguageKeyboard } from '../keyboards/inlineKeyboard';

const welcomeMessages: Record<string, string> = {
  uz: `🚗 <b>OsonPrava</b>ga xush kelibsiz!

Haydovchilik guvohnomasi imtihoniga tayyorlaning:

📝 <b>1210+</b> savol barcha biletlardan
🎫 <b>61</b> ta rasmiy bilet
🧠 <b>Aqlli test</b> — SM-2 algoritmi
⚔️ <b>Oktagon</b> — 1v1 onlayn bellashuv
📊 Batafsil statistika va progress

Boshlash uchun pastdagi tugmalardan foydalaning! 👇`,

  ru: `🚗 Добро пожаловать в <b>OsonPrava</b>!

Подготовьтесь к экзамену на водительские права:

📝 <b>1210+</b> вопросов из всех билетов
🎫 <b>61</b> официальный билет
🧠 <b>Умный тест</b> — алгоритм SM-2
⚔️ <b>Октагон</b> — онлайн-баттл 1 на 1
📊 Подробная статистика и прогресс

Используйте кнопки ниже для начала! 👇`,

  kr: `🚗 <b>ОсонПрава</b>га хуш келибсиз!

Ҳайдовчилик гувоҳномаси имтиҳонига тайёрланинг:

📝 <b>1210+</b> савол барча билетлардан
🎫 <b>61</b> та расмий билет
🧠 <b>Ақлли тест</b> — SM-2 алгоритми
⚔️ <b>Октагон</b> — 1в1 онлайн беллашув
📊 Батафсил статистика ва прогресс

Бошлаш учун пастдаги тугмалардан фойдаланинг! 👇`,
};

export function setupCommands(bot: Bot<MyContext>) {
  bot.command('start', async (ctx) => {
    const lang = ctx.session.language || 'uz';

    // Ask language choice first
    await ctx.reply('🌐 Tilni tanlang / Выберите язык:', {
      reply_markup: getLanguageKeyboard(),
    });

    // Send welcome message with main keyboard
    await ctx.reply(welcomeMessages[lang] || welcomeMessages.uz, {
      parse_mode: 'HTML',
      reply_markup: getMainKeyboard(lang),
    });
  });

  // Handle text from reply keyboard
  bot.hears(/📝.*(Test|Тест|тест)/i, async (ctx) => {
    ctx.session.currentQuestionIndex = 0;
    ctx.session.correctCount = 0;
    ctx.session.questions = [];
    await ctx.reply('Loading test...', { parse_mode: 'HTML' });
    // This will be handled by test command logic
    const { startQuickTest } = await import('./test');
    await startQuickTest(ctx);
  });

  bot.hears(/🎫.*(Bilet|Билет)/i, async (ctx) => {
    const { showTickets } = await import('./tickets');
    await showTickets(ctx);
  });

  bot.hears(/📊.*(Stat|Стат)/i, async (ctx) => {
    const { showStats } = await import('./stats');
    await showStats(ctx);
  });

  bot.hears(/⚙️.*(Sozla|Настрой|Созла)/i, async (ctx) => {
    const { showSettings } = await import('./settings');
    await showSettings(ctx);
  });
}
