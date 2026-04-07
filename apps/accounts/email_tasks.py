"""
Celery Tasks for Email System
Trilingual support: uz (Latin), ru (Russian), kr (Cyrillic)
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


@shared_task(bind=True, max_retries=3)
def send_verification_email(self, email, token, lang='uz'):
    """
    Send email verification link
    Args:
        email: User email
        token: Verification token (32-byte random hex)
        lang: Language code (uz, ru, kr)
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    verification_link = f"{frontend_url}/verify-email?token={token}"
    
    # Trilingual content
    content = {
        'uz': {
            'subject': "Emailni tasdiqlang - OsonPrava",
            'greeting': "Assalomu alaykum!",
            'message': "OsonPrava platformasiga xush kelibsiz! Email manzilingizni tasdiqlash uchun quyidagi tugmani bosing:",
            'button_text': "Emailni tasdiqlash",
            'footer': "Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.",
            'thanks': "Rahmat, OsonPrava jamoasi"
        },
        'ru': {
            'subject': "Подтверждение email - OsonPrava",
            'greeting': "Здравствуйте!",
            'message': "Добро пожаловать на платформу OsonPrava! Для подтверждения вашего email адреса нажмите на кнопку ниже:",
            'button_text': "Подтвердить email",
            'footer': "Если вы не регистрировались, проигнорируйте это сообщение.",
            'thanks': "Спасибо, команда OsonPrava"
        },
        'kr': {
            'subject': "Электрон почтани тасдиқланг - OsonPrava",
            'greeting': "Ассалому алайкум!",
            'message': "OsonPrava платформасига хуш келибсиз! Электрон почта манзилингизни тасдиқлаш учун қуйидаги тугмани босинг:",
            'button_text': "Электрон почтани тасдиқлаш",
            'footer': "Агар сиз рўйхатдан ўтмаган бўлсангиз, бу хабарни эътиборсиз қолдиринг.",
            'thanks': "Раҳмат, OsonPrava жамоаси"
        }
    }
    
    lang_content = content.get(lang, content['uz'])
    
    # Render HTML template
    context = {
        'verification_link': verification_link,
        'greeting': lang_content['greeting'],
        'message': lang_content['message'],
        'button_text': lang_content['button_text'],
        'footer': lang_content['footer'],
        'thanks': lang_content['thanks'],
        'theme_color': '#58CC02'  # Duolingo-style green
    }
    
    try:
        html_message = render_to_string('emails/verification.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=lang_content['subject'],
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as exc:
        # Retry on failure
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, email, token, lang='uz'):
    """
    Send password reset link
    """
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    content = {
        'uz': {
            'subject': "Parolni tiklash - OsonPrava",
            'greeting': "Assalomu alaykum!",
            'message': "Parolingizni tiklash uchun quyidagi havolaga o'ting. Bu havola 1 soat amal qiladi:",
            'button_text': "Parolni tiklash",
            'footer': "Agar parolni tiklashni so'ramagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.",
            'thanks': "Rahmat, OsonPrava jamoasi"
        },
        'ru': {
            'subject': "Восстановление пароля - OsonPrava",
            'greeting': "Здравствуйте!",
            'message': "Для восстановления пароля перейдите по ссылке ниже. Ссылка действительна в течение 1 часа:",
            'button_text': "Восстановить пароль",
            'footer': "Если вы не запрашивали восстановление пароля, проигнорируйте это сообщение.",
            'thanks': "Спасибо, команда OsonPrava"
        },
        'kr': {
            'subject': "Паролни тиклаш - OsonPrava",
            'greeting': "Ассалому алайкум!",
            'message': "Паролингизни тиклаш учун қуйидаги ҳаволага ўтинг. Бу ҳавола 1 соат амал қилади:",
            'button_text': "Паролни тиклаш",
            'footer': "Агар паролни тиклашни сўрамаган бўлсангиз, бу хабарни эътиборсиз қолдиринг.",
            'thanks': "Раҳмат, OsonPrava жамоаси"
        }
    }
    
    lang_content = content.get(lang, content['uz'])
    
    context = {
        'reset_link': reset_link,
        'greeting': lang_content['greeting'],
        'message': lang_content['message'],
        'button_text': lang_content['button_text'],
        'footer': lang_content['footer'],
        'thanks': lang_content['thanks'],
        'theme_color': '#FF9600'  # Orange for password reset
    }
    
    try:
        html_message = render_to_string('emails/password_reset.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=lang_content['subject'],
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def send_welcome_email(self, email, first_name='', lang='uz'):
    """
    Send welcome/onboarding email after successful registration
    """
    content = {
        'uz': {
            'subject': "OsonPrava ga xush kelibsiz! 🎉",
            'greeting': f"Assalomu alaykum, {first_name or 'do'stim'}!",
            'message': "OsonPrava platformasiga xush kelibsiz! Endi siz PDD (Yo'l harakati qoidalari) imtihoniga tayyorlanishingiz mumkin.",
            'features': [
                "📚 Barcha mavzular bo'yicha savollar",
                "🎫 Chiptalar bilan ishlash",
                "📊 Shaxsiy statistika",
                "🧠 Aqlli takrorlash tizimi (SM-2)",
                "⚔️ 1v1 Battle rejimi"
            ],
            'button_text': "O'rganishni boshlash",
            'footer': "Savollaringiz bo'lsa, biz bilan bog'laning.",
            'thanks': "Rahmat, OsonPrava jamoasi"
        },
        'ru': {
            'subject': "Добро пожаловать в OsonPrava! 🎉",
            'greeting': f"Здравствуйте, {first_name or 'друг'}!",
            'message': "Добро пожаловать на платформу OsonPrava! Теперь вы можете подготовиться к экзамену ПДД (Правила дорожного движения).",
            'features': [
                "📚 Вопросы по всем темам",
                "🎫 Работа с билетами",
                "📊 Личная статистика",
                "🧠 Система умного повторения (SM-2)",
                "⚔️ Режим 1v1 Battle"
            ],
            'button_text': "Начать обучение",
            'footer': "Если у вас есть вопросы, свяжитесь с нами.",
            'thanks': "Спасибо, команда OsonPrava"
        },
        'kr': {
            'subject': "OsonPrava га хуш келибсиз! 🎉",
            'greeting': f"Ассалому алайкум, {first_name or 'дўстим'}!",
            'message': "OsonPrava платформасига хуш келибсиз! Энди сиз ҲҚҚ (Йўл ҳаракати қоидалари) имтиҳонига тайёрланишингиз мумкин.",
            'features': [
                "📚 Барча мавзулар бўйича саволлар",
                "🎫 Чипталар билан ишлаш",
                "📊 Шахсий статистика",
                "🧠 Ақлли такрорлаш тизими (SM-2)",
                "⚔️ 1v1 Battle режими"
            ],
            'button_text': "Ўрганишни бошлаш",
            'footer': "Саволларингиз бўлса, биз билан боғланинг.",
            'thanks': "Раҳмат, OsonPrava жамоаси"
        }
    }
    
    lang_content = content.get(lang, content['uz'])
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
    
    features_html = ''.join([f"<li style='margin: 8px 0;'>{feature}</li>" for feature in lang_content['features']])
    
    context = {
        'dashboard_link': f"{frontend_url}/dashboard",
        'greeting': lang_content['greeting'],
        'message': lang_content['message'],
        'features_html': features_html,
        'button_text': lang_content['button_text'],
        'footer': lang_content['footer'],
        'thanks': lang_content['thanks'],
        'theme_color': '#58CC02'
    }
    
    try:
        html_message = render_to_string('emails/welcome.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=lang_content['subject'],
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))


@shared_task
def send_notification_email(email, title, body, lang='uz'):
    """
    Send general notification email
    """
    subject_map = {
        'uz': title,
        'ru': title,
        'kr': title
    }
    
    subject = subject_map.get(lang, title)
    
    context = {
        'title': title,
        'body': body,
        'theme_color': '#58CC02'
    }
    
    try:
        html_message = render_to_string('emails/notification.html', context)
        plain_message = strip_tags(html_message)
        
        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return True
    except Exception:
        return False
