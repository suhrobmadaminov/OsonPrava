import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private frontendUrl: string;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: this.configService.get<number>('SMTP_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://app.osonprava.uz';
  }

  async sendVerificationEmail(email: string, token: string, lang: string = 'uz') {
    const verifyLink = `${this.frontendUrl}/verify-email?token=${token}`;
    const translations = this.getEmailTranslations(lang);

    const html = this.getVerificationEmailHtml(translations, verifyLink);

    await this.sendMail({
      to: email,
      subject: translations.subject,
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string, lang: string = 'uz') {
    const resetLink = `${this.frontendUrl}/reset-password?token=${token}`;
    const translations = this.getPasswordResetTranslations(lang);

    const html = this.getPasswordResetEmailHtml(translations, resetLink);

    await this.sendMail({
      to: email,
      subject: translations.subject,
      html,
    });
  }

  async sendWelcomeEmail(email: string, firstName: string | null, lang: string = 'uz') {
    const translations = this.getWelcomeTranslations(lang);
    const name = firstName || 'Foydalanuvchi';

    const html = this.getWelcomeEmailHtml(translations, name);

    await this.sendMail({
      to: email,
      subject: translations.subject,
      html,
    });
  }

  private async sendMail(options: { to: string; subject: string; html: string }) {
    const from = this.configService.get<string>('EMAIL_FROM') || 'noreply@osonprava.uz';

    try {
      await this.transporter.sendMail({
        from: `"OsonPrava" <${from}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      // In development, don't throw — just log
      if (this.configService.get<string>('NODE_ENV') !== 'production') {
        this.logger.debug(`[DEV MODE] Email would be sent: ${JSON.stringify(options)}`);
      }
    }
  }

  private getVerificationEmailHtml(t: any, link: string): string {
    return `
<!DOCTYPE html>
<html lang="${t.lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:shadow;">
        <tr><td style="padding:40px 30px;text-align:center;">
          <h1 style="color:#58CC02;margin:0 0 10px;font-size:28px;">OsonPrava</h1>
          <p style="color:#888;font-size:14px;margin:0 0 30px;">${t.subtitle}</p>
          <p style="color:#333;font-size:16px;margin:0 0 30px;">${t.greeting}</p>
          <a href="${link}" style="display:inline-block;background:#58CC02;color:#fff;padding:14px 40px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">${t.button}</a>
          <p style="color:#888;font-size:13px;margin:30px 0 0;">${t.fallback}<br><a href="${link}" style="color:#1CB0F6;word-break:break-all;">${link}</a></p>
          <p style="color:#aaa;font-size:12px;margin:20px 0 0;">${t.ignore}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private getPasswordResetEmailHtml(t: any, link: string): string {
    return `
<!DOCTYPE html>
<html lang="${t.lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:shadow;">
        <tr><td style="padding:40px 30px;text-align:center;">
          <h1 style="color:#FF9600;margin:0 0 10px;font-size:28px;">OsonPrava</h1>
          <p style="color:#888;font-size:14px;margin:0 0 30px;">${t.subtitle}</p>
          <p style="color:#333;font-size:16px;margin:0 0 30px;">${t.greeting}</p>
          <a href="${link}" style="display:inline-block;background:#FF9600;color:#fff;padding:14px 40px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">${t.button}</a>
          <p style="color:#888;font-size:13px;margin:30px 0 0;">${t.fallback}<br><a href="${link}" style="color:#1CB0F6;word-break:break-all;">${link}</a></p>
          <p style="color:#aaa;font-size:12px;margin:20px 0 0;">${t.ignore}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private getWelcomeEmailHtml(t: any, name: string): string {
    return `
<!DOCTYPE html>
<html lang="${t.lang}">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:shadow;">
        <tr><td style="padding:40px 30px;text-align:center;">
          <h1 style="color:#58CC02;margin:0 0 10px;font-size:28px;">OsonPrava 🎉</h1>
          <p style="color:#888;font-size:14px;margin:0 0 30px;">${t.subtitle}</p>
          <p style="color:#333;font-size:18px;margin:0 0 10px;">${t.greeting} ${name}!</p>
          <p style="color:#555;font-size:15px;margin:0 0 30px;">${t.body}</p>
          <a href="${this.frontendUrl}" style="display:inline-block;background:#58CC02;color:#fff;padding:14px 40px;text-decoration:none;border-radius:8px;font-size:16px;font-weight:bold;">${t.button}</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  }

  private getEmailTranslations(lang: string) {
    const translations: Record<string, any> = {
      uz: {
        lang: 'uz',
        subject: "📧 Emailingizni tasdiqlang — OsonPrava",
        subtitle: "Yo'llar harakati qoidalari platformasi",
        greeting: "Email manzilingizni tasdiqlash uchun quyidagi tugmani bosing:",
        button: "✅ Tasdiqlash",
        fallback: "Yoki brauzeringizda ushbu havolani oching:",
        ignore: "Agar ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.",
      },
      ru: {
        lang: 'ru',
        subject: "📧 Подтвердите ваш email — OsonPrava",
        subtitle: "Платформа правил дорожного движения",
        greeting: "Нажмите кнопку ниже, чтобы подтвердить ваш email:",
        button: "✅ Подтвердить",
        fallback: "Или откройте эту ссылку в браузере:",
        ignore: "Если вы не регистрировались, проигнорируйте это письмо.",
      },
      kr: {
        lang: 'kr',
        subject: "📧 Электрон почтангизни тасдиқланг — OsonPrava",
        subtitle: "Йўл ҳаракати қоидалари платформаси",
        greeting: "Электрон почта манзилингизни тасдиқлаш учун қуйидаги тугмани босинг:",
        button: "✅ Тасдиқлаш",
        fallback: "Ёки ушбу ҳаволани браузерда очинг:",
        ignore: "Агар рўйхатдан ўтмаган бўлсангиз, бу хабарни эътиборсиз қолдиринг.",
      },
    };
    return translations[lang] || translations.uz;
  }

  private getPasswordResetTranslations(lang: string) {
    const translations: Record<string, any> = {
      uz: {
        lang: 'uz',
        subject: "🔑 Parolni tiklash — OsonPrava",
        subtitle: "Yo'llar harakati qoidalari platformasi",
        greeting: "Parolingizni tiklash uchun quyidagi tugmani bosing. Havola 1 soat amal qiladi:",
        button: "🔑 Parolni tiklash",
        fallback: "Yoki brauzeringizda ushbu havolani oching:",
        ignore: "Agar parolni tiklashni so'ramagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.",
      },
      ru: {
        lang: 'ru',
        subject: "🔑 Сброс пароля — OsonPrava",
        subtitle: "Платформа правил дорожного движения",
        greeting: "Нажмите кнопку ниже, чтобы сбросить пароль. Ссылка действительна 1 час:",
        button: "🔑 Сбросить пароль",
        fallback: "Или откройте эту ссылку в браузере:",
        ignore: "Если вы не запрашивали сброс пароля, проигнорируйте это письмо.",
      },
      kr: {
        lang: 'kr',
        subject: "🔑 Паролни тиклаш — OsonPrava",
        subtitle: "Йўл ҳаракати қоидалари платформаси",
        greeting: "Паролингизни тиклаш учун қуйидаги тугмани босинг. Ҳавола 1 соат амал қилади:",
        button: "🔑 Паролни тиклаш",
        fallback: "Ёки ушбу ҳаволани браузерда очинг:",
        ignore: "Агар паролни тиклашни сўрамаган бўлсангиз, бу хабарни эътиборсиз қолдиринг.",
      },
    };
    return translations[lang] || translations.uz;
  }

  private getWelcomeTranslations(lang: string) {
    const translations: Record<string, any> = {
      uz: {
        lang: 'uz',
        subject: "🎉 Xush kelibsiz! — OsonPrava",
        subtitle: "Yo'llar harakati qoidalari platformasi",
        greeting: "Assalomu alaykum,",
        body: "OsonPrava platformasiga muvaffaqiyatli ro'yxatdan o'tdingiz! Endi Yo'l harakati qoidalarini o'rganishni boshlashingiz mumkin.",
        button: "🚀 Boshlash",
      },
      ru: {
        lang: 'ru',
        subject: "🎉 Добро пожаловать! — OsonPrava",
        subtitle: "Платформа правил дорожного движения",
        greeting: "Здравствуйте,",
        body: "Вы успешно зарегистрировались на платформе OsonPrava! Теперь вы можете начать изучать правила дорожного движения.",
        button: "🚀 Начать",
      },
      kr: {
        lang: 'kr',
        subject: "🎉 Хуш келибсиз! — OsonPrava",
        subtitle: "Йўл ҳаракати қоидалари платформаси",
        greeting: "Ассалому алайкум,",
        body: "OsonPrava платформасига муваффақиятли рўйхатдан ўтдингиз! Энди Йўл Ҳаракати Қоидаларини ўрганишни бошлашингиз мумкин.",
        button: "🚀 Бошлаш",
      },
    };
    return translations[lang] || translations.uz;
  }
}
