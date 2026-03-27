import { Keyboard } from 'grammy';
import { config } from '../config';

export function getMainKeyboard(lang = 'uz') {
  const texts: Record<string, { test: string; tickets: string; stats: string; settings: string; app: string }> = {
    uz: { test: '📝 Test boshlash', tickets: '🎫 Biletlar', stats: '📊 Statistika', settings: '⚙️ Sozlamalar', app: '📱 Ilovaga o\'tish ▶' },
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
