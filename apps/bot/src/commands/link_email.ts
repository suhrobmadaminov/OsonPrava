import { Bot } from 'grammy';
import { MyContext } from '../types';
import { apiService } from '../services/apiService';

export function setupLinkEmailCommand(bot: Bot<MyContext>) {
  bot.command('link_email', async (ctx) => {
    const lang = ctx.session.language || 'uz';

    const messages: Record<string, string> = {
      uz: `📧 <b>Emailingizni ulash</b>

Telegram hisobingizga email manzilini ulash uchun emailingizni yuboring.

Email orqali parolni tiklash va xavfsizlik uchun foydalaniladi.

❌ Bekor qilish: /cancel`,
      ru: `📧 <b>Привязка email</b>

Отправьте ваш email для привязки к Telegram аккаунту.

Email используется для восстановления пароля и безопасности.

❌ Отмена: /cancel`,
      kr: `📧 <b>Emailни улаш</b>

Телеграм ҳисобингизга email манзилини улаш учун emailingизни юборинг.

Email паролни тиклаш ва хавфсизлик учун ишлатилади.

❌ Бекор қилиш: /cancel`,
    };

    ctx.session.linkEmailMode = true;
    await ctx.reply(messages[lang] || messages.uz, { parse_mode: 'HTML' });
  });

  // Handle email text input when in link_email mode
  bot.on('message:text', async (ctx) => {
    // Skip if not in link email mode
    if (!ctx.session.linkEmailMode) return;

    // Handle cancel
    if (ctx.message.text.toLowerCase() === '/cancel') {
      ctx.session.linkEmailMode = false;
      const lang = ctx.session.language || 'uz';
      const cancelMsg: Record<string, string> = {
        uz: '❌ Email ulash bekor qilindi',
        ru: '❌ Привязка email отменена',
        kr: '❌ Email улаш бекор қилинди',
      };
      await ctx.reply(cancelMsg[lang] || cancelMsg.uz);
      return;
    }

    const email = ctx.message.text.trim();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const lang = ctx.session.language || 'uz';
      const invalidMsg: Record<string, string> = {
        uz: '❌ Noto\'g\'ri email formati. Qayta urinib ko\'ring yoki /cancel bosing.',
        ru: '❌ Неверный формат email. Попробуйте снова или нажмите /cancel.',
        kr: '❌ Нотўғри email формати. Қайта уриниб кўринг ёки /cancel босинг.',
      };
      await ctx.reply(invalidMsg[lang] || invalidMsg.uz);
      return;
    }

    try {
      // Link email to Telegram account
      const userId = ctx.session.userId || ctx.from.id.toString();
      const result = await apiService.linkEmail(userId, email);

      ctx.session.linkEmailMode = false;
      const lang = ctx.session.language || 'uz';

      const successMsg: Record<string, string> = {
        uz: `✅ <b>Muvaffaqiyatli ulandi!</b>\n\n📧 Email: ${email}\n\n🔗 Tasdiqlash uchun pochtangizga xat yuborildi.`,
        ru: `✅ <b>Успешно привязано!</b>\n\n📧 Email: ${email}\n\n🔗 Письмо для подтверждения отправлено на вашу почту.`,
        kr: `✅ <b>Муваффақиятли уланди!</b>\n\n📧 Email: ${email}\n\n🔗 Тасдиқлаш учун почтангизга хат юборилди.`,
      };

      await ctx.reply(successMsg[lang] || successMsg.uz, { parse_mode: 'HTML' });
    } catch (err: any) {
      const lang = ctx.session.language || 'uz';
      const errorMsg: Record<string, string> = {
        uz: `❌ Xatolik: ${err.response?.data?.message || 'Email ulanmadi'}`,
        ru: `❌ Ошибка: ${err.response?.data?.message || 'Не удалось привязать email'}`,
        kr: `❌ Хатолик: ${err.response?.data?.message || 'Email уланмади'}`,
      };
      await ctx.reply(errorMsg[lang] || errorMsg.uz);
    }
  });
}
