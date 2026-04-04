# OsonPrava - Django Backend

Haydash guvohnomasi testlari platformasi (Django + DRF)

## 🚀 Texnologiyalar

- **Framework:** Django 5.0.4
- **API:** Django REST Framework 3.15.1
- **Database:** PostgreSQL + Prisma
- **Cache:** Redis
- **WebSocket:** Django Channels (1v1 Battle)
- **Queue:** Celery + Redis
- **Auth:** JWT (Simple JWT)
- **Deploy:** Railway

## 📦 O'rnatish

```bash
# Virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Dependencies
pip install -r requirements.txt

# Environment
cp .env.example .env

# Database
python manage.py makemigrations
python manage.py migrate

# Superuser (Admin panel)
python manage.py createsuperuser

# Ishga tushirish
python manage.py runserver
```

## 🎯 Admin Panel

`http://localhost:8000/admin/`

- Foydalanuvchilar
- Savollar va Javoblar
- Chiptalar
- Test sessiyalar
- 1v1 Battle matchlar
- Obunalar
- Blog postlar
- Yo'l belgilari
- Bildirishnomalar
- Yutuqlar

## 📚 API Dokumentatsiya

- **Swagger:** `http://localhost:8000/api/docs/`
- **ReDoc:** `http://localhost:8000/api/redoc/`

## 🔑 API Endpoints

### Auth
- `POST /api/v1/auth/register/` - Ro'yxatdan o'tish
- `POST /api/v1/auth/login/` - Kirish (JWT)
- `POST /api/v1/auth/refresh/` - Token yangilash

### Users
- `GET /api/v1/users/` - Foydalanuvchilar ro'yxati
- `GET /api/v1/users/me/` - Profil
- `PATCH /api/v1/users/update_me/` - Profil yangilash

### Content
- `GET /api/v1/topics/` - Mavzular
- `GET /api/v1/questions/` - Savollar
- `GET /api/v1/tickets/` - Chiptalar
- `GET /api/v1/signs/` - Yo'l belgilari
- `GET /api/v1/blog/` - Blog postlar

### Tests
- `POST /api/v1/test-sessions/` - Test boshlash
- `POST /api/v1/test-sessions/{id}/submit_answer/` - Javob yuborish
- `POST /api/v1/test-sessions/{id}/finish/` - Testni tugatish

### Smart Test (Spaced Repetition)
- `GET /api/v1/smart-test/` - Ko'rib chiqish kerak bo'lgan savollar
- `POST /api/v1/smart-test/` - Statistika yangilash

### Octagon (1v1 Battle)
- `GET /api/v1/octagon/matches/` - Matchlar
- `POST /api/v1/octagon/matches/create_match/` - Yangi match
- `WebSocket: ws://localhost:8000/ws/octagon/<match_id>/` - Real-time

### Leaderboard
- `GET /api/v1/leaderboard/top-users/` - Top foydalanuvchilar
- `GET /api/v1/leaderboard/my-rank/` - Mening reytingim

### Subscriptions
- `GET /api/v1/subscriptions/` - Mening obunalarim
- `GET /api/v1/subscriptions/current/` - Joriy obuna

### Notifications
- `GET /api/v1/notifications/` - Bildirishnomalar
- `GET /api/v1/notifications/unread/` - O'qilmagan
- `POST /api/v1/notifications/mark_all_read/` - Hammasini o'qish

## 🐳 Docker

```bash
# Build
docker-compose build

# Run
docker-compose up

# Migrate
docker-compose run web python manage.py migrate

# Superuser
docker-compose run web python manage.py createsuperuser
```

## 📊 Database Modellar

1. **User** - Foydalanuvchilar (Custom User)
2. **Topic** - Mavzular
3. **Question** - Savollar (3 tilda)
4. **Answer** - Javoblar
5. **Ticket** - Chiptalar
6. **TestSession** - Test sessiyalar
7. **TestAnswer** - Test javoblari
8. **UserQuestionStat** - Spaced repetition statistikasi
9. **OctagonMatch** - 1v1 Battle matchlar
10. **OctagonPlayer** - Battle o'yinchilar
11. **Achievement** - Yutuqlar
12. **UserAchievement** - Foydalanuvchi yutuqlari
13. **Subscription** - Obunalar
14. **BlogPost** - Blog postlar
15. **RoadSign** - Yo'l belgilari
16. **Notification** - Bildirishnomalar

## 🛠️ Celery Tasks

```bash
# Worker
celery -A config worker -l info

# Beat (Periodic tasks)
celery -A config beat -l info
```

## 🌐 Production Deploy (Railway)

1. PostgreSQL database yarating
2. Redis instance yarating
3. Environment variables sozlang
4. `railway.toml` avtomatik deploy qiladi

## 📝 License

MIT
