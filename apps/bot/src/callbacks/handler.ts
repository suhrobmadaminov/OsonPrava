import { getMainKeyboard } from '../keyboards/mainKeyboard';
import { sendQuestion } from '../commands/test';
import { showTickets } from '../commands/tickets';

const starsPrices: Record<string, { amount: number; label: string }> = {
  '1month': { amount: 50, label: 'OsonPrava Premium — 1 oy' },
  '3months': { amount: 125, label: 'OsonPrava Premium — 3 oy' },
  '1year': { amount: 375, label: 'OsonPrava Premium — 1 yil' },
  'forever': { amount: 750, label: 'OsonPrava Premium — Doimiy' },
};

export async function handleCallback(ctx: any) {
  try {
    const data = ctx.callbackQuery.data as string;
    await ctx.answerCallbackQuery();

    // Language selection
    if (data.startsWith('lang:')) {
      const lang = data.split(':')[1];
      ctx.session.language = lang;

      const confirmMessages: Record<string, string> = {
        uz: '✅ Til o\'zgartirildi: O\'zbek',
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
      const selectedAnswer = question.answers.find((a: any) => a.id === answerId);
      const correctAnswer = question.answers.find((a: any) => a.isCorrect);

      if (!selectedAnswer) return;

      const isCorrect = selectedAnswer.isCorrect;
      if (isCorrect) ctx.session.correctCount++;

      const emoji = isCorrect ? '✅' : '❌';
      const correctText = isCorrect ? '' : `\n\n✅ To'g'ri javob: <b>${correctAnswer?.text || ''}</b>`;

      await ctx.editMessageText(
        `${emoji} ${selectedAnswer.text}${correctText}`,
        { parse_mode: 'HTML' },
      );

      // Auto-advance to next question after 1 second
      ctx.session.currentQuestionIndex = index + 1;

      if (index + 1 < questions.length) {
        setTimeout(async () => {
          try {
            await sendQuestion(ctx, index + 1);
          } catch (err) {
            console.error('Error sending next question:', err);
          }
        }, 1000);
      } else {
        // Test complete
        const correct = ctx.session.correctCount;
        const total = questions.length;
        const percent = Math.round((correct / total) * 100);
        const passed = percent >= 72;

        const resultEmoji = passed ? '🎉' : '😔';
        const lang = ctx.session.language || 'uz';

        const messages: Record<string, string> = {
          uz: `${resultEmoji} <b>Test natijasi:</b>\n\n✅ To'g'ri: ${correct}/${total}\n📊 Ball: ${percent}%\n\n${passed ? 'Ajoyib natija! Davom eting! 💪' : 'Mashq qiling va qayta urinib ko\'ring!'}`,
          ru: `${resultEmoji} <b>Результат теста:</b>\n\n✅ Правильно: ${correct}/${total}\n📊 Балл: ${percent}%\n\n${passed ? 'Отличный результат! Продолжайте! 💪' : 'Тренируйтесь и попробуйте снова!'}`,
          kr: `${resultEmoji} <b>Тест натижаси:</b>\n\n✅ Тўғри: ${correct}/${total}\n📊 Балл: ${percent}%\n\n${passed ? 'Ажойиб натижа! Давом этинг! 💪' : 'Машқ қилинг ва қайта уриниб кўринг!'}`,
        };

        setTimeout(async () => {
          try {
            await ctx.reply(messages[lang] || messages.uz, { parse_mode: 'HTML' });
          } catch (err) {
            console.error('Error sending test result:', err);
          }
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

    // Ticket page navigation
    if (data.startsWith('ticket_page:')) {
      const page = parseInt(data.split(':')[1]);
      if (isNaN(page)) return;
      await showTickets(ctx, page);
      return;
    }

    // Ticket selection
    if (data.startsWith('ticket:')) {
      const ticketId = parseInt(data.split(':')[1]);
      if (isNaN(ticketId)) return;
      const lang = ctx.session.language || 'uz';
      const msgs: Record<string, string> = {
        uz: `🎫 Bilet ${ticketId} tanlandi. Mini App'da to'liq biletni yechish uchun "Ilovaga o'tish" tugmasini bosing.`,
        ru: `🎫 Билет ${ticketId} выбран. Для прохождения полного билета нажмите "Перейти в приложение".`,
        kr: `🎫 Билет ${ticketId} танланди. Мини Апп'да тўлиқ билетни ечиш учун "Иловага ўтиш" тугмасини босинг.`,
      };
      await ctx.reply(msgs[lang] || msgs.uz);
      return;
    }

    // Premium purchase (Telegram Stars)
    if (data.startsWith('premium:')) {
      const plan = data.split(':')[1];
      const priceInfo = starsPrices[plan];

      if (!priceInfo) return;

      await ctx.replyWithInvoice(
        priceInfo.label,
        'OsonPrava Premium obuna',
        plan,
        'XTR', // Telegram Stars currency
        [{ label: priceInfo.label, amount: priceInfo.amount }],
      );
      return;
    }

    // Noop (page counter etc.)
    if (data === 'noop') return;
  } catch (err) {
    console.error('Callback handler error:', err);
    try {
      await ctx.answerCallbackQuery({ text: 'Xatolik yuz berdi. Qayta urinib ko\'ring.' });
    } catch {
      // ignore double-answer errors
    }
  }
}
