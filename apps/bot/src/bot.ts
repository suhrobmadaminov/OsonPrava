import { Bot, session, GrammyError, HttpError } from 'grammy';
import { config } from './config';
import { logger } from './middlewares/logger';
import { authMiddleware } from './middlewares/auth';

export interface SessionData {
  language: string;
  token: string | null;
  linkEmailMode: boolean;
  userId: string | null;
}

function initialSession(): SessionData {
  return {
    language: 'uz',
    token: null,
    linkEmailMode: false,
    userId: null,
  };
}

const bot = new Bot(config.botToken);

// Session middleware
bot.use(session({
  initial: initialSession,
}));

// Logger middleware
bot.use(logger);

// Auth middleware
bot.use(authMiddleware);

// /start command
bot.command('start', async (ctx) => {
  const lang = ctx.session.language || 'uz';

  const messages: Record<string, string> = {
    uz: `🚗 <b>OsonPrava</b>ga xush kelibsiz!

Haydovchilik guvohnomasi imtihoniga tayyorlaning.

📝 <b>1210+</b> savol barcha biletlardan
🎫 <b>61</b> ta rasmiy bilet
🧠 <b>Aqlli test</b> — SM-2 algoritmi
📊 Batafsil statistika va progress

👇 Ilovaga o'tish uchun pastdagi tugmani bosing!`,

    ru: `🚗 Добро пожаловать в <b>OsonPrava</b>!

Подготовьтесь к экзамену на водительские права.

📝 <b>1210+</b> вопросов из всех билетов
🎫 <b>61</b> официальный билет
🧠 <b>Умный тест</b> — алгоритм SM-2
📊 Подробная статистика и прогресс

👇 Нажмите кнопку ниже, чтобы перейти в приложение!`,

    kr: `🚗 <b>ОсонПрава</b>га хуш келибсиз!

Ҳайдовчилик гувоҳномаси имтиҳонига тайёрланинг.

📝 <b>1210+</b> савол барча билетлардан
🎫 <b>61</b> та расмий билет
🧠 <b>Ақлли тест</b> — SM-2 алгоритми
📊 Батафсил статистика ва прогресс

👇 Иловага ўтиш учун пастдаги тугмани босинг!`,
  };

  const { Keyboard } = await import('grammy');

  const appButtonTexts: Record<string, string> = {
    uz: '📱 Ilovaga o\'tish',
    ru: '📱 Открыть приложение',
    kr: '📱 Иловага ўтиш',
  };

  const keyboard = new Keyboard()
    .webApp(appButtonTexts[lang] || appButtonTexts.uz, config.webAppUrl)
    .resized()
    .persistent();

  await ctx.reply(messages[lang] || messages.uz, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
});

// /help command
bot.command('help', async (ctx) => {
  const lang = ctx.session.language || 'uz';

  const messages: Record<string, string> = {
    uz: `❓ <b>Yordam</b>

/start — Botni ishga tushirish
/help — Shu xabar

📱 Testlarni yechish uchun <b>Ilovaga o'tish</b> tugmasini bosing.

Savollar uchun: @EasyPrava_bot`,

    ru: `❓ <b>Помощь</b>

/start — Запустить бота
/help — Это сообщение

📱 Для прохождения тестов нажмите <b>Открыть приложение</b>.

Вопросы: @EasyPrava_bot`,

    kr: `❓ <b>Ёрдам</b>

/start — Ботни ишга тушириш
/help — Шу хабар

📱 Тестларни ечиш учун <b>Иловага ўтиш</b> тугмасини босинг.

Саволлар учун: @EasyPrava_bot`,
  };

  await ctx.reply(messages[lang] || messages.uz, { parse_mode: 'HTML' });
});

// Language selection via callback
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  await ctx.answerCallbackQuery();

  if (data.startsWith('lang:')) {
    const lang = data.split(':')[1];
    ctx.session.language = lang;

    const confirmMessages: Record<string, string> = {
      uz: '✅ Til o\'zgartirildi: O\'zbek',
      ru: '✅ Язык изменён: Русский',
      kr: '✅ Тил ўзгартирилди: Ўзбек',
    };

    const { Keyboard } = await import('grammy');
    const appButtonTexts: Record<string, string> = {
      uz: '📱 Ilovaga o\'tish',
      ru: '📱 Открыть приложение',
      kr: '📱 Иловага ўтиш',
    };

    const keyboard = new Keyboard()
      .webApp(appButtonTexts[lang] || appButtonTexts.uz, config.webAppUrl)
      .resized()
      .persistent();

    await ctx.reply(confirmMessages[lang] || confirmMessages.uz, {
      reply_markup: keyboard,
    });
  }
});

// Error handler
bot.catch((err) => {
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error('Grammy error:', e.message);
  } else if (e instanceof HttpError) {
    console.error('HTTP error:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

export { bot };
