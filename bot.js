// ============================================================
// OsonPrava Telegram Bot — Standalone JavaScript version
// Run: node bot.js
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, 'apps/bot/.env') });

const { Bot, session, InlineKeyboard, Keyboard, GrammyError, HttpError } = require(require('path').join(__dirname, 'apps/bot/node_modules/grammy'));
const axios = require(require('path').join(__dirname, 'apps/bot/node_modules/axios'));

// ======================== CONFIG ========================
const config = {
  botToken: process.env.BOT_TOKEN,
  apiUrl: process.env.API_URL || 'http://localhost:3001/api/v1',
  botApiKey: process.env.BOT_API_KEY || '',
  webAppUrl: process.env.WEB_APP_URL || 'https://app.osonprava.uz',
  adminIds: (process.env.ADMIN_IDS || '').split(',').map(Number).filter(Boolean),
};

if (!config.botToken) {
  console.error('BOT_TOKEN environment variable is required!');
  process.exit(1);
}

// ======================== API SERVICE ========================
const api = axios.create({
  baseURL: config.apiUrl,
  headers: { 'Content-Type': 'application/json', 'X-Bot-Key': config.botApiKey },
  timeout: 10000,
});

const apiService = {
  async loginUser(data) {
    const res = await api.post('/auth/telegram-bot', { initData: JSON.stringify(data) });
    return res.data;
  },
  async getRandomQuestions(count = 5, token) {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await api.get(`/questions/random?count=${count}`, { headers });
    return res.data;
  },
  async getUserStats(token) {
    const res = await api.get('/stats', { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  },
  async createStarsSubscription(userId, plan, paymentId, token) {
    const res = await api.post('/subscription/telegram-stars', {
      userId, plan, telegramPaymentId: paymentId,
    }, { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  },
};

// ======================== FALLBACK QUESTIONS (offline mode) ========================
const fallbackQuestions = [
  {
    id: 'f1',
    textUz: "Yo'l harakati qoidalariga ko'ra, piyodalar yo'l o'tish joyisiz kesib o'tishga ruxsat etiladimi?",
    textRu: 'Разрешено ли пешеходам переходить дорогу вне пешеходного перехода?',
    textCyr: "Йўл ҳаракати қоидаларига кўра, пиёдалар йўл ўтиш жойисиз кесиб ўтишга рухсат этиладими?",
    imageUrl: null,
    answers: [
      { id: 'f1a', textUz: "Ha, agar ko'rinish chegarasida piyodalar o'tish joyi bo'lmasa", textRu: 'Да, если в пределах видимости нет пешеходного перехода', textCyr: "Ҳа, агар кўриниш чегарасида пиёдалар ўтиш жойи бўлмаса", isCorrect: true },
      { id: 'f1b', textUz: "Yo'q, faqat belgilangan joylardan", textRu: 'Нет, только в установленных местах', textCyr: "Йўқ, фақат белгиланган жойлардан", isCorrect: false },
      { id: 'f1c', textUz: "Ha, istalgan joydan o'tish mumkin", textRu: 'Да, можно в любом месте', textCyr: "Ҳа, исталган жойдан ўтиш мумкин", isCorrect: false },
      { id: 'f1d', textUz: "Faqat tungi vaqtda", textRu: 'Только в ночное время', textCyr: "Фақат тунги вақтда", isCorrect: false },
    ],
  },
  {
    id: 'f2',
    textUz: "Qaysi belgi asosiy yo'lni bildiradi?",
    textRu: 'Какой знак обозначает главную дорогу?',
    textCyr: "Қайси белги асосий йўлни билдиради?",
    imageUrl: null,
    answers: [
      { id: 'f2a', textUz: "Sariq rombsimon belgi", textRu: 'Жёлтый ромбовидный знак', textCyr: "Сариқ ромбсимон белги", isCorrect: true },
      { id: 'f2b', textUz: "Qizil uchburchak", textRu: 'Красный треугольник', textCyr: "Қизил учбурчак", isCorrect: false },
      { id: 'f2c', textUz: "Ko'k to'rtburchak", textRu: 'Синий прямоугольник', textCyr: "Кўк тўртбурчак", isCorrect: false },
      { id: 'f2d', textUz: "Yashil doira", textRu: 'Зелёный круг', textCyr: "Яшил доира", isCorrect: false },
    ],
  },
  {
    id: 'f3',
    textUz: "Shahar ichida transport vositalarining ruxsat etilgan maksimal tezligi qancha?",
    textRu: 'Какова максимальная разрешённая скорость транспортных средств в населённом пункте?',
    textCyr: "Шаҳар ичида транспорт воситаларининг рухсат этилган максимал тезлиги қанча?",
    imageUrl: null,
    answers: [
      { id: 'f3a', textUz: "60 km/soat", textRu: '60 км/ч', textCyr: "60 км/соат", isCorrect: true },
      { id: 'f3b', textUz: "80 km/soat", textRu: '80 км/ч', textCyr: "80 км/соат", isCorrect: false },
      { id: 'f3c', textUz: "40 km/soat", textRu: '40 км/ч', textCyr: "40 км/соат", isCorrect: false },
      { id: 'f3d', textUz: "50 km/soat", textRu: '50 км/ч', textCyr: "50 км/соат", isCorrect: false },
    ],
  },
  {
    id: 'f4',
    textUz: "Haydovchi qachon xavfsizlik kamarini taqishi shart?",
    textRu: 'Когда водитель обязан пристёгиваться ремнём безопасности?',
    textCyr: "Ҳайдовчи қачон хавфсизлик камарини тақиши шарт?",
    imageUrl: null,
    answers: [
      { id: 'f4a', textUz: "Har doim harakatlanayotganda", textRu: 'Всегда при движении', textCyr: "Ҳар доим ҳаракатланаётганда", isCorrect: true },
      { id: 'f4b', textUz: "Faqat shaharlararo yo'llarda", textRu: 'Только на загородных дорогах', textCyr: "Фақат шаҳарлараро йўлларда", isCorrect: false },
      { id: 'f4c', textUz: "Faqat tezligi 60 km/soatdan oshganda", textRu: 'Только при скорости более 60 км/ч', textCyr: "Фақат тезлиги 60 км/соатдан ошганда", isCorrect: false },
      { id: 'f4d', textUz: "Faqat magistral yo'llarda", textRu: 'Только на магистралях', textCyr: "Фақат магистрал йўлларда", isCorrect: false },
    ],
  },
  {
    id: 'f5',
    textUz: "Qizil svetofor yonganda haydovchi nima qilishi kerak?",
    textRu: 'Что должен делать водитель при красном сигнале светофора?',
    textCyr: "Қизил светофор ёнганда ҳайдовчи нима қилиши керак?",
    imageUrl: null,
    answers: [
      { id: 'f5a', textUz: "To'xtash chizig'i oldida to'xtashi kerak", textRu: 'Остановиться перед стоп-линией', textCyr: "Тўхташ чизиғи олдида тўхташи керак", isCorrect: true },
      { id: 'f5b', textUz: "Sekin harakatlanishi mumkin", textRu: 'Может двигаться медленно', textCyr: "Секин ҳаракатланиши мумкин", isCorrect: false },
      { id: 'f5c', textUz: "O'ngga burilishi mumkin", textRu: 'Может повернуть направо', textCyr: "Ўнгга бурилиши мумкин", isCorrect: false },
      { id: 'f5d', textUz: "Signal bersa o'tishi mumkin", textRu: 'Может проехать подав сигнал', textCyr: "Сигнал берса ўтиши мумкин", isCorrect: false },
    ],
  },
  {
    id: 'f6',
    textUz: "Qaysi holatda haydovchiga qo'shimcha ta'lim talab etiladi?",
    textRu: 'В каком случае водителю требуется дополнительное обучение?',
    textCyr: "Қайси ҳолатда ҳайдовчига қўшимча таълим талаб этилади?",
    imageUrl: null,
    answers: [
      { id: 'f6a', textUz: "Guvohnoma muddati tugaganda", textRu: 'При истечении срока удостоверения', textCyr: "Гувоҳнома муддати тугаганда", isCorrect: true },
      { id: 'f6b', textUz: "Har yili", textRu: 'Каждый год', textCyr: "Ҳар йили", isCorrect: false },
      { id: 'f6c', textUz: "Har 6 oyda", textRu: 'Каждые 6 месяцев', textCyr: "Ҳар 6 ойда", isCorrect: false },
      { id: 'f6d', textUz: "Hech qachon talab etilmaydi", textRu: 'Никогда не требуется', textCyr: "Ҳеч қачон талаб этилмайди", isCorrect: false },
    ],
  },
  {
    id: 'f7',
    textUz: "Avtomobil tormoz yo'li nimaga bog'liq?",
    textRu: 'От чего зависит тормозной путь автомобиля?',
    textCyr: "Автомобил тормоз йўли нимага боғлиқ?",
    imageUrl: null,
    answers: [
      { id: 'f7a', textUz: "Tezlik va yo'l qoplamasi holatiga", textRu: 'От скорости и состояния дорожного покрытия', textCyr: "Тезлик ва йўл қопламаси ҳолатига", isCorrect: true },
      { id: 'f7b', textUz: "Faqat avtomobil og'irligiga", textRu: 'Только от массы автомобиля', textCyr: "Фақат автомобил оғирлигига", isCorrect: false },
      { id: 'f7c', textUz: "Faqat tezlikka", textRu: 'Только от скорости', textCyr: "Фақат тезликка", isCorrect: false },
      { id: 'f7d', textUz: "Faqat ob-havoga", textRu: 'Только от погоды', textCyr: "Фақат об-ҳавога", isCorrect: false },
    ],
  },
  {
    id: 'f8',
    textUz: "Kesishma oldida qaysi transport vositasi birinchi o'tadi?",
    textRu: 'Какое транспортное средство проезжает перекрёсток первым?',
    textCyr: "Кесишма олдида қайси транспорт воситаси биринчи ўтади?",
    imageUrl: null,
    answers: [
      { id: 'f8a', textUz: "Asosiy yo'lda harakatlanayotgan", textRu: 'Движущееся по главной дороге', textCyr: "Асосий йўлда ҳаракатланаётган", isCorrect: true },
      { id: 'f8b', textUz: "O'ng tomondagi", textRu: 'Справа', textCyr: "Ўнг томондаги", isCorrect: false },
      { id: 'f8c', textUz: "Chap tomondagi", textRu: 'Слева', textCyr: "Чап томондаги", isCorrect: false },
      { id: 'f8d', textUz: "Katta transport vositasi", textRu: 'Более крупное ТС', textCyr: "Катта транспорт воситаси", isCorrect: false },
    ],
  },
  {
    id: 'f9',
    textUz: "Avtomagistralda minimal tezlik qancha?",
    textRu: 'Какова минимальная скорость на автомагистрали?',
    textCyr: "Автомагистралда минимал тезлик қанча?",
    imageUrl: null,
    answers: [
      { id: 'f9a', textUz: "40 km/soat", textRu: '40 км/ч', textCyr: "40 км/соат", isCorrect: true },
      { id: 'f9b', textUz: "60 km/soat", textRu: '60 км/ч', textCyr: "60 км/соат", isCorrect: false },
      { id: 'f9c', textUz: "30 km/soat", textRu: '30 км/ч', textCyr: "30 км/соат", isCorrect: false },
      { id: 'f9d', textUz: "Cheklov yo'q", textRu: 'Нет ограничения', textCyr: "Чеклов йўқ", isCorrect: false },
    ],
  },
  {
    id: 'f10',
    textUz: "Qaysi belgida to'xtash taqiqlanadi?",
    textRu: 'Какой знак запрещает остановку?',
    textCyr: "Қайси белгида тўхташ тақиқланади?",
    imageUrl: null,
    answers: [
      { id: 'f10a', textUz: "Ko'k fonda qizil X belgisi", textRu: 'Синий фон с красным X', textCyr: "Кўк фонда қизил X белгиси", isCorrect: true },
      { id: 'f10b', textUz: "Qizil doira", textRu: 'Красный круг', textCyr: "Қизил доира", isCorrect: false },
      { id: 'f10c', textUz: "Sariq uchburchak", textRu: 'Жёлтый треугольник', textCyr: "Сариқ учбурчак", isCorrect: false },
      { id: 'f10d', textUz: "Yashil to'rtburchak", textRu: 'Зелёный прямоугольник', textCyr: "Яшил тўртбурчак", isCorrect: false },
    ],
  },
];

// ======================== HELPERS ========================
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getQuestionText(q, lang) {
  return lang === 'ru' ? q.textRu : lang === 'kr' ? q.textCyr : q.textUz;
}

function getAnswerText(a, lang) {
  return lang === 'ru' ? a.textRu : lang === 'kr' ? a.textCyr : a.textUz;
}

function getFallbackQuestions(count, lang) {
  return shuffleArray(fallbackQuestions).slice(0, count).map(q => ({
    id: q.id,
    text: getQuestionText(q, lang),
    imageUrl: q.imageUrl,
    answers: q.answers.map(a => ({
      id: a.id,
      text: getAnswerText(a, lang),
      isCorrect: a.isCorrect,
    })),
  }));
}

function formatQuestion(num, total, text) {
  return `📝 <b>Savol ${num}/${total}</b>\n\n${text}`;
}

function getProgressBar(percent, length = 10) {
  const filled = Math.round((percent / 100) * length);
  return '▓'.repeat(filled) + '░'.repeat(length - filled);
}

// ======================== KEYBOARDS ========================
function getLanguageKeyboard() {
  return new InlineKeyboard()
    .text("🇺🇿 O'zbek", 'lang:uz')
    .text('🇺🇿 Ўзбек', 'lang:kr')
    .text('🇷🇺 Русский', 'lang:ru');
}

function getMainKeyboard(lang = 'uz') {
  const texts = {
    uz: { test: '📝 Test boshlash', tickets: '🎫 Biletlar', stats: '📊 Statistika', settings: '⚙️ Sozlamalar', app: "📱 Ilovaga o'tish ▶" },
    ru: { test: '📝 Начать тест', tickets: '🎫 Билеты', stats: '📊 Статистика', settings: '⚙️ Настройки', app: '📱 Перейти в приложение ▶' },
    kr: { test: '📝 Тест бошлаш', tickets: '🎫 Билетлар', stats: '📊 Статистика', settings: '⚙️ Созламалар', app: '📱 Иловага ўтиш ▶' },
  };
  const t = texts[lang] || texts.uz;

  return new Keyboard()
    .text(t.test).text(t.tickets).row()
    .text(t.stats).text(t.settings).row()
    .webApp(t.app, config.webAppUrl)
    .resized()
    .persistent();
}

function getAnswerKeyboard(answers, questionIndex) {
  const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
  const kb = new InlineKeyboard();
  answers.forEach((answer, i) => {
    const label = labels[i] || String.fromCharCode(65 + i);
    kb.text(`${label}) ${answer.text}`.slice(0, 64), `answer:${questionIndex}:${answer.id}`);
    if (i % 2 === 1) kb.row();
  });
  if (answers.length % 2 === 1) kb.row();
  return kb;
}

function getTicketPageKeyboard(page, totalPages) {
  const kb = new InlineKeyboard();
  const start = page * 10 + 1;
  const end = Math.min((page + 1) * 10, 61);
  for (let i = start; i <= end; i++) {
    kb.text(`Bilet ${i}`, `ticket:${i}`);
    if (i % 5 === 0 || i === end) kb.row();
  }
  if (page > 0) kb.text('◀️', `ticket_page:${page - 1}`);
  kb.text(`${page + 1}/${totalPages}`, 'noop');
  if (page < totalPages - 1) kb.text('▶️', `ticket_page:${page + 1}`);
  return kb;
}

function getPremiumKeyboard(lang = 'uz') {
  const texts = {
    uz: { m1: '⭐ 1 oy — 50 Stars', m3: '⭐ 3 oy — 125 Stars', y1: '⭐ 1 yil — 375 Stars', forever: '⭐ Doimiy — 750 Stars' },
    ru: { m1: '⭐ 1 месяц — 50 Stars', m3: '⭐ 3 месяца — 125 Stars', y1: '⭐ 1 год — 375 Stars', forever: '⭐ Навсегда — 750 Stars' },
    kr: { m1: '⭐ 1 ой — 50 Stars', m3: '⭐ 3 ой — 125 Stars', y1: '⭐ 1 йил — 375 Stars', forever: '⭐ Доимий — 750 Stars' },
  };
  const t = texts[lang] || texts.uz;
  return new InlineKeyboard()
    .text(t.m1, 'premium:1month').row()
    .text(t.m3, 'premium:3months').row()
    .text(t.y1, 'premium:1year').row()
    .text(t.forever, 'premium:forever');
}

// ======================== MESSAGES ========================
const welcomeMessages = {
  uz: `🚗 <b>EasyPrava</b>ga xush kelibsiz!

Haydovchilik guvohnomasi imtihoniga tayyorlaning:

📝 <b>1210+</b> savol barcha biletlardan
🎫 <b>61</b> ta rasmiy bilet
🧠 <b>Aqlli test</b> — SM-2 algoritmi
⚔️ <b>Oktagon</b> — 1v1 onlayn bellashuv
📊 Batafsil statistika va progress

Boshlash uchun pastdagi tugmalardan foydalaning! 👇`,

  ru: `🚗 Добро пожаловать в <b>EasyPrava</b>!

Подготовьтесь к экзамену на водительские права:

📝 <b>1210+</b> вопросов из всех билетов
🎫 <b>61</b> официальный билет
🧠 <b>Умный тест</b> — алгоритм SM-2
⚔️ <b>Октагон</b> — онлайн-баттл 1 на 1
📊 Подробная статистика и прогресс

Используйте кнопки ниже для начала! 👇`,

  kr: `🚗 <b>ЕаsyПрава</b>га хуш келибсиз!

Ҳайдовчилик гувоҳномаси имтиҳонига тайёрланинг:

📝 <b>1210+</b> савол барча билетлардан
🎫 <b>61</b> та расмий билет
🧠 <b>Ақлли тест</b> — SM-2 алгоритми
⚔️ <b>Октагон</b> — 1в1 онлайн беллашув
📊 Батафсил статистика ва прогресс

Бошлаш учун пастдаги тугмалардан фойдаланинг! 👇`,
};

const helpMessages = {
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

Savollar uchun: @EasyPravaSupport`,

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

Вопросы: @EasyPravaSupport`,

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

Саволлар учун: @EasyPravaSupport`,
};

const premiumMessages = {
  uz: `👑 <b>EasyPrava Premium</b>

Premium imkoniyatlar:
🧠 Aqlli test (SM-2 algoritmi)
🔊 Audio tushuntirishlar
🚫 Reklama yo'q
🏅 Maxsus badgelar
⚡ Prioritet qo'llab-quvvatlash

Tarifni tanlang:`,

  ru: `👑 <b>EasyPrava Premium</b>

Премиум возможности:
🧠 Умный тест (алгоритм SM-2)
🔊 Аудио объяснения
🚫 Без рекламы
🏅 Специальные бейджи
⚡ Приоритетная поддержка

Выберите тариф:`,

  kr: `👑 <b>ЕаsyПрава Премиум</b>

Премиум имкониятлар:
🧠 Ақлли тест (SM-2 алгоритми)
🔊 Аудио тушунтиришлар
🚫 Реклама йўқ
🏅 Махсус бадгелар
⚡ Приоритет қўллаб-қувватлаш

Тарифни танланг:`,
};

// ======================== BOT SETUP ========================
const bot = new Bot(config.botToken);

// In-memory session
bot.use(session({
  initial: () => ({
    language: 'uz',
    token: null,
    testId: null,
    currentQuestionIndex: 0,
    questions: [],
    correctCount: 0,
    ticketPage: 0,
  }),
}));

// Logger middleware
bot.use(async (ctx, next) => {
  const start = Date.now();
  const user = ctx.from;
  const text = ctx.message?.text || ctx.callbackQuery?.data || '';
  await next();
  const ms = Date.now() - start;
  console.log(`[${new Date().toISOString()}] ${user?.id} (${user?.username || '-'}): ${text} [${ms}ms]`);
});

// Auth middleware — try API, skip if unavailable
bot.use(async (ctx, next) => {
  if (!ctx.from) return next();
  if (!ctx.session.token) {
    try {
      const result = await apiService.loginUser({
        id: ctx.from.id,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
        username: ctx.from.username,
        language_code: ctx.from.language_code,
      });
      ctx.session.token = result.accessToken;
    } catch {
      // API not available — continue in offline mode
    }
  }
  return next();
});

// ======================== COMMANDS ========================

// /start
bot.command('start', async (ctx) => {
  const lang = ctx.session.language || 'uz';
  await ctx.reply('🌐 Tilni tanlang / Выберите язык:', {
    reply_markup: getLanguageKeyboard(),
  });
  await ctx.reply(welcomeMessages[lang] || welcomeMessages.uz, {
    parse_mode: 'HTML',
    reply_markup: getMainKeyboard(lang),
  });
});

// /test
async function sendQuestion(ctx, index) {
  const questions = ctx.session.questions;
  if (index >= questions.length) return;
  const q = questions[index];
  const text = formatQuestion(index + 1, questions.length, q.text);
  const keyboard = getAnswerKeyboard(q.answers, index);
  if (q.imageUrl) {
    await ctx.replyWithPhoto(q.imageUrl, { caption: text, parse_mode: 'HTML', reply_markup: keyboard });
  } else {
    await ctx.reply(text, { parse_mode: 'HTML', reply_markup: keyboard });
  }
}

async function startQuickTest(ctx) {
  const lang = ctx.session.language || 'uz';
  try {
    const questions = await apiService.getRandomQuestions(5, ctx.session.token);
    ctx.session.questions = questions.map(q => ({
      id: q.id,
      text: getQuestionText(q, lang),
      imageUrl: q.imageUrl,
      answers: q.answers.map(a => ({ id: a.id, text: getAnswerText(a, lang), isCorrect: a.isCorrect })),
    }));
  } catch {
    // API unavailable — use fallback
    ctx.session.questions = getFallbackQuestions(5, lang);
  }
  ctx.session.currentQuestionIndex = 0;
  ctx.session.correctCount = 0;
  await sendQuestion(ctx, 0);
}

bot.command('test', async (ctx) => {
  ctx.session.currentQuestionIndex = 0;
  ctx.session.correctCount = 0;
  ctx.session.questions = [];
  await startQuickTest(ctx);
});

// /tickets
const TOTAL_TICKETS = 61;
const TOTAL_PAGES = Math.ceil(TOTAL_TICKETS / 10);

async function showTickets(ctx, page = 0) {
  const lang = ctx.session.language || 'uz';
  ctx.session.ticketPage = page;
  const titles = {
    uz: '🎫 <b>Biletni tanlang:</b>',
    ru: '🎫 <b>Выберите билет:</b>',
    kr: '🎫 <b>Билетни танланг:</b>',
  };
  await ctx.reply(titles[lang] || titles.uz, {
    parse_mode: 'HTML',
    reply_markup: getTicketPageKeyboard(page, TOTAL_PAGES),
  });
}

bot.command('tickets', async (ctx) => {
  await showTickets(ctx);
});

// /stats
bot.command('stats', async (ctx) => {
  const lang = ctx.session.language || 'uz';
  try {
    if (!ctx.session.token) {
      const msgs = {
        uz: "⚠️ Statistika hozircha mavjud emas. Server ulanmagan.\n\n📱 To'liq statistika uchun ilovaga o'ting: app.osonprava.uz",
        ru: '⚠️ Статистика пока недоступна. Сервер не подключён.\n\n📱 Полная статистика в приложении: app.osonprava.uz',
        kr: "⚠️ Статистика ҳозирча мавжуд эмас. Сервер уланмаган.\n\n📱 Тўлиқ статистика учун иловага ўтинг: app.osonprava.uz",
      };
      await ctx.reply(msgs[lang] || msgs.uz);
      return;
    }
    const stats = await apiService.getUserStats(ctx.session.token);
    const messages = {
      uz: `📊 <b>Sizning statistikangiz:</b>\n\n✅ To'g'ri javoblar: <b>${stats.totalCorrect || 0}</b>\n❌ Noto'g'ri javoblar: <b>${stats.totalWrong || 0}</b>\n📈 O'rganilganlik: <b>${stats.progressPercent || 0}%</b>\n🔥 Streak: <b>${stats.streak || 0}</b> kun\n⏱ Umumiy vaqt: <b>${Math.floor((stats.totalTimeSec || 0) / 60)}</b> daqiqa\n\nDavom eting! 💪`,
      ru: `📊 <b>Ваша статистика:</b>\n\n✅ Правильных: <b>${stats.totalCorrect || 0}</b>\n❌ Неправильных: <b>${stats.totalWrong || 0}</b>\n📈 Изучено: <b>${stats.progressPercent || 0}%</b>\n🔥 Серия: <b>${stats.streak || 0}</b> дней\n⏱ Общее время: <b>${Math.floor((stats.totalTimeSec || 0) / 60)}</b> мин\n\nПродолжайте! 💪`,
      kr: `📊 <b>Сизнинг статистикангиз:</b>\n\n✅ Тўғри жавоблар: <b>${stats.totalCorrect || 0}</b>\n❌ Нотўғри жавоблар: <b>${stats.totalWrong || 0}</b>\n📈 Ўрганилганлик: <b>${stats.progressPercent || 0}%</b>\n🔥 Streak: <b>${stats.streak || 0}</b> кун\n⏱ Умумий вақт: <b>${Math.floor((stats.totalTimeSec || 0) / 60)}</b> дақиқа\n\nДавом этинг! 💪`,
    };
    await ctx.reply(messages[lang] || messages.uz, { parse_mode: 'HTML' });
  } catch {
    await ctx.reply('❌ Statistikani yuklashda xatolik.');
  }
});

// /settings
bot.command('settings', async (ctx) => {
  const lang = ctx.session.language || 'uz';
  const messages = {
    uz: '⚙️ <b>Sozlamalar</b>\n\nTilni tanlang:',
    ru: '⚙️ <b>Настройки</b>\n\nВыберите язык:',
    kr: '⚙️ <b>Созламалар</b>\n\nТилни танланг:',
  };
  await ctx.reply(messages[lang] || messages.uz, {
    parse_mode: 'HTML',
    reply_markup: getLanguageKeyboard(),
  });
});

// /premium
bot.command('premium', async (ctx) => {
  const lang = ctx.session.language || 'uz';
  await ctx.reply(premiumMessages[lang] || premiumMessages.uz, {
    parse_mode: 'HTML',
    reply_markup: getPremiumKeyboard(lang),
  });
});

// /help
bot.command('help', async (ctx) => {
  const lang = ctx.session.language || 'uz';
  await ctx.reply(helpMessages[lang] || helpMessages.uz, { parse_mode: 'HTML' });
});

// ======================== TEXT HANDLERS (Reply Keyboard) ========================
bot.hears(/📝.*(Test|Тест|тест|boshlash|бошлаш)/i, async (ctx) => {
  ctx.session.currentQuestionIndex = 0;
  ctx.session.correctCount = 0;
  ctx.session.questions = [];
  await startQuickTest(ctx);
});

bot.hears(/🎫.*(Bilet|Билет|билетлар)/i, async (ctx) => {
  await showTickets(ctx);
});

bot.hears(/📊.*(Stat|Стат|statistika)/i, async (ctx) => {
  const lang = ctx.session.language || 'uz';
  if (!ctx.session.token) {
    const msgs = {
      uz: "⚠️ Statistika hozircha mavjud emas.\n\n📱 To'liq statistika: app.osonprava.uz",
      ru: '⚠️ Статистика пока недоступна.\n\n📱 Статистика: app.osonprava.uz',
      kr: "⚠️ Статистика ҳозирча мавжуд эмас.\n\n📱 Статистика: app.osonprava.uz",
    };
    await ctx.reply(msgs[lang] || msgs.uz);
    return;
  }
  try {
    const stats = await apiService.getUserStats(ctx.session.token);
    await ctx.reply(`📊 To'g'ri: ${stats.totalCorrect || 0} | Noto'g'ri: ${stats.totalWrong || 0} | ${stats.progressPercent || 0}%`);
  } catch {
    await ctx.reply('❌ Statistikani yuklashda xatolik.');
  }
});

bot.hears(/⚙️.*(Sozla|Настрой|Созла)/i, async (ctx) => {
  const lang = ctx.session.language || 'uz';
  await ctx.reply('🌐 Tilni tanlang:', { reply_markup: getLanguageKeyboard() });
});

// ======================== CALLBACK HANDLERS ========================
const starsPrices = {
  '1month': { amount: 50, label: 'EasyPrava Premium — 1 oy' },
  '3months': { amount: 125, label: 'EasyPrava Premium — 3 oy' },
  '1year': { amount: 375, label: 'EasyPrava Premium — 1 yil' },
  'forever': { amount: 750, label: 'EasyPrava Premium — Doimiy' },
};

bot.on('callback_query:data', async (ctx) => {
  try {
    const data = ctx.callbackQuery.data;
    await ctx.answerCallbackQuery();

    // Language selection
    if (data.startsWith('lang:')) {
      const lang = data.split(':')[1];
      ctx.session.language = lang;
      const confirmMessages = {
        uz: "✅ Til o'zgartirildi: O'zbek",
        ru: '✅ Язык изменён: Русский',
        kr: '✅ Тил ўзгартирилди: Ўзбек',
      };
      await ctx.reply(confirmMessages[lang] || confirmMessages.uz, {
        reply_markup: getMainKeyboard(lang),
      });
      return;
    }

    // Answer selection
    if (data.startsWith('answer:')) {
      const parts = data.split(':');
      if (parts.length < 3) return;
      const index = parseInt(parts[1]);
      const answerId = parts[2];
      if (isNaN(index)) return;

      const questions = ctx.session.questions;
      if (!questions || index >= questions.length) return;

      const question = questions[index];
      const selectedAnswer = question.answers.find(a => a.id === answerId);
      const correctAnswer = question.answers.find(a => a.isCorrect);
      if (!selectedAnswer) return;

      const isCorrect = selectedAnswer.isCorrect;
      if (isCorrect) ctx.session.correctCount++;

      const emoji = isCorrect ? '✅' : '❌';
      const correctText = isCorrect ? '' : `\n\n✅ To'g'ri javob: <b>${correctAnswer?.text || ''}</b>`;

      await ctx.editMessageText(`${emoji} ${selectedAnswer.text}${correctText}`, { parse_mode: 'HTML' });

      ctx.session.currentQuestionIndex = index + 1;

      if (index + 1 < questions.length) {
        setTimeout(async () => {
          try { await sendQuestion(ctx, index + 1); } catch (err) { console.error('Error sending next question:', err); }
        }, 1000);
      } else {
        // Test complete
        const correct = ctx.session.correctCount;
        const total = questions.length;
        const percent = Math.round((correct / total) * 100);
        const passed = percent >= 72;
        const resultEmoji = passed ? '🎉' : '😔';
        const lang = ctx.session.language || 'uz';
        const bar = getProgressBar(percent);

        const messages = {
          uz: `${resultEmoji} <b>Test natijasi:</b>\n\n✅ To'g'ri: ${correct}/${total}\n📊 Ball: ${percent}%\n${bar}\n\n${passed ? 'Ajoyib natija! Davom eting! 💪' : "Mashq qiling va qayta urinib ko'ring! 📚"}`,
          ru: `${resultEmoji} <b>Результат теста:</b>\n\n✅ Правильно: ${correct}/${total}\n📊 Балл: ${percent}%\n${bar}\n\n${passed ? 'Отличный результат! Продолжайте! 💪' : 'Тренируйтесь и попробуйте снова! 📚'}`,
          kr: `${resultEmoji} <b>Тест натижаси:</b>\n\n✅ Тўғри: ${correct}/${total}\n📊 Балл: ${percent}%\n${bar}\n\n${passed ? 'Ажойиб натижа! Давом этинг! 💪' : "Машқ қилинг ва қайта уриниб кўринг! 📚"}`,
        };

        setTimeout(async () => {
          try { await ctx.reply(messages[lang] || messages.uz, { parse_mode: 'HTML' }); } catch (err) { console.error('Error sending result:', err); }
        }, 1000);
      }
      return;
    }

    // Next question
    if (data === 'next_question') {
      const index = ctx.session.currentQuestionIndex;
      await sendQuestion(ctx, index);
      return;
    }

    // Ticket page
    if (data.startsWith('ticket_page:')) {
      const page = parseInt(data.split(':')[1]);
      if (!isNaN(page)) await showTickets(ctx, page);
      return;
    }

    // Ticket selection
    if (data.startsWith('ticket:')) {
      const ticketId = parseInt(data.split(':')[1]);
      if (isNaN(ticketId)) return;
      const lang = ctx.session.language || 'uz';
      const msgs = {
        uz: `🎫 Bilet ${ticketId} tanlandi.\n\n📱 To'liq biletni yechish uchun ilovaga o'ting:\n${config.webAppUrl}`,
        ru: `🎫 Билет ${ticketId} выбран.\n\n📱 Для прохождения полного билета перейдите в приложение:\n${config.webAppUrl}`,
        kr: `🎫 Билет ${ticketId} танланди.\n\n📱 Тўлиқ билетни ечиш учун иловага ўтинг:\n${config.webAppUrl}`,
      };
      await ctx.reply(msgs[lang] || msgs.uz);
      return;
    }

    // Premium purchase
    if (data.startsWith('premium:')) {
      const plan = data.split(':')[1];
      const priceInfo = starsPrices[plan];
      if (!priceInfo) return;
      await ctx.replyWithInvoice(
        priceInfo.label,
        'OsonPrava Premium obuna',
        plan,
        'XTR',
        [{ label: priceInfo.label, amount: priceInfo.amount }],
      );
      return;
    }

    if (data === 'noop') return;
  } catch (err) {
    console.error('Callback error:', err);
    try { await ctx.answerCallbackQuery({ text: 'Xatolik yuz berdi.' }); } catch {}
  }
});

// Pre-checkout (Telegram Stars)
bot.on('pre_checkout_query', async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

// Successful payment
bot.on('message:successful_payment', async (ctx) => {
  const payment = ctx.message.successful_payment;
  await ctx.reply("✅ To'lov muvaffaqiyatli amalga oshirildi! Premium faollashtirildi. 🎉");
  if (ctx.session.token) {
    apiService.createStarsSubscription(
      String(ctx.from.id),
      payment.invoice_payload,
      payment.telegram_payment_charge_id,
      ctx.session.token,
    ).catch(() => {});
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

// ======================== START BOT ========================
async function start() {
  console.log('🤖 OsonPrava Bot starting...');

  await bot.api.setMyCommands([
    { command: 'start', description: 'Botni ishga tushirish' },
    { command: 'test', description: 'Tezkor test (5 savol)' },
    { command: 'tickets', description: 'Biletlar' },
    { command: 'stats', description: 'Statistika' },
    { command: 'settings', description: 'Sozlamalar' },
    { command: 'premium', description: 'Premium obuna' },
    { command: 'help', description: 'Yordam' },
  ]);

  // Always use polling for now
  await bot.api.deleteWebhook();
  bot.start({
    onStart: () => console.log('✅ OsonPrava Bot ishga tushdi! (polling mode)'),
  });
}

start().catch((err) => {
  console.error('❌ Bot ishga tushmadi:', err);
  process.exit(1);
});
