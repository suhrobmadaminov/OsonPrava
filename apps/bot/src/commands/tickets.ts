import { Bot } from 'grammy';
import { MyContext } from '../types';
import { getTicketPageKeyboard } from '../keyboards/inlineKeyboard';

const TOTAL_TICKETS = 61;
const TOTAL_PAGES = Math.ceil(TOTAL_TICKETS / 10);

export async function showTickets(ctx: any, page = 0) {
  const lang = ctx.session.language || 'uz';
  ctx.session.ticketPage = page;

  const titles: Record<string, string> = {
    uz: '🎫 <b>Biletni tanlang:</b>',
    ru: '🎫 <b>Выберите билет:</b>',
    kr: '🎫 <b>Билетни танланг:</b>',
  };

  await ctx.reply(titles[lang] || titles.uz, {
    parse_mode: 'HTML',
    reply_markup: getTicketPageKeyboard(page, TOTAL_PAGES),
  });
}

export function setupTicketsCommand(bot: Bot<MyContext>) {
  bot.command('tickets', async (ctx) => {
    await showTickets(ctx);
  });
}
