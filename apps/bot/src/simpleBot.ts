import { Bot, Keyboard } from 'grammy';
import { config } from './config';

// Bot yaratish - @EasyPrava_bot
const bot = new Bot(config.botToken);

// /start buyrug'i - faqat saytdan ro'yxatdan o'tish
bot.command('start', async (ctx) => {
  const lang = ctx.from?.language_code?.startsWith('ru') ? 'ru' : 'uz';

  const messages = {
    uz: `🚗 <b>OsonPrava</b>ga xush kelibsiz!

Haydovchilik guvohnomasi imtihoniga tayyorlaning.

✅ <b>1210+</b> savol
✅ <b>61</b> ta bilet
✅ <b>Bepul</b> va reklamasiz
✅ <b>Offline</b> rejim

👇 Ro'yxatdan o'tish uchun tugmani bosing!`,

    ru: `🚗 Добро пожаловать в <b>OsonPrava</b>!

Подготовьтесь к экзамену на водительские права.

✅ <b>1210+</b> вопросов
✅ <b>61</b> билет
✅ <b>Бесплатно</b> и без рекламы
✅ <b>Офлайн</b> режим

👇 Нажмите кнопку для регистрации!`,
  };

  const keyboard = new Keyboard()
    .webApp('📝 Ro\'yxatdan o\'tish', config.registrationUrl)
    .resized();

  await ctx.reply(messages[lang] || messages.uz, {
    parse_mode: 'HTML',
    reply_markup: keyboard,
  });
});

// /help buyrug'i
bot.command('help', async (ctx) => {
  const lang = ctx.from?.language_code?.startsWith('ru') ? 'ru' : 'uz';

  const messages = {
    uz: `❓ <b>Yordam</b>

/start — Botni ishga tushirish
/help — Shu xabar

📱 Ro'yxatdan o'tish uchun <b>Ro'yxatdan o'tish</b> tugmasini bosing.`,

    ru: `❓ <b>Помощь</b>

/start — Запустить бота
/help — Это сообщение

📱 Для регистрации нажмите <b>Ro'yxatdan o'tish</b>.`,
  };

  await ctx.reply(messages[lang] || messages.uz, { parse_mode: 'HTML' });
});

// Xatolar
bot.catch((err) => {
  console.error('Bot error:', err.error);
});

export { bot };
