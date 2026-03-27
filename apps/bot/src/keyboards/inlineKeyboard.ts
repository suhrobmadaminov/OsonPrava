import { InlineKeyboard } from 'grammy';

export function getLanguageKeyboard() {
  return new InlineKeyboard()
    .text("🇺🇿 O'zbek", 'lang:uz')
    .text('🇺🇿 Ўзбек', 'lang:kr')
    .text('🇷🇺 Русский', 'lang:ru');
}

export function getTicketPageKeyboard(page: number, totalPages: number) {
  const kb = new InlineKeyboard();

  const start = page * 10 + 1;
  const end = Math.min((page + 1) * 10, 61);

  for (let i = start; i <= end; i++) {
    kb.text(`Bilet ${i}`, `ticket:${i}`);
    if (i % 5 === 0 || i === end) kb.row();
  }

  // Pagination
  if (page > 0) kb.text('◀️', `ticket_page:${page - 1}`);
  kb.text(`${page + 1}/${totalPages}`, 'noop');
  if (page < totalPages - 1) kb.text('▶️', `ticket_page:${page + 1}`);

  return kb;
}

export function getPremiumKeyboard(lang = 'uz') {
  const texts: Record<string, { m1: string; m3: string; y1: string; forever: string }> = {
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
