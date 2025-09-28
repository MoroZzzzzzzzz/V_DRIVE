# 🚀 VELES DRIVE - Deployment Guide

Полное руководство по развертыванию платформы VELES DRIVE на любом VPS с помощью Docker.

## 📋 Требования

- **VPS/Server**: минимум 2GB RAM, 2 CPU cores, 20GB свободного места
- **Docker & Docker Compose**: версия 20.10+
- **Операционная система**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **Порты**: 80, 443, 3000, 8001 (настраиваемые)

## 🛠️ Быстрая установка

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo apt install docker-compose-plugin -y

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Клонирование проекта

```bash
# Загрузка проекта
git clone <your-repo-url> veles-drive
cd veles-drive

# Или загрузка архива и распаковка
wget <archive-url>
tar -xzf veles-drive.tar.gz
cd veles-drive
```

### 3. Конфигурация

```bash
# Копирование и настройка environment файла
cp .env.example .env
nano .env
```

**Обязательно настройте в .env:**
```bash
# Database (измените пароли!)
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_password_here

# Security (сгенерируйте уникальные ключи!)
SECRET_KEY=your-unique-secret-key-here
JWT_SECRET=your-unique-jwt-secret-here

# Domain (ваш домен)
CORS_ORIGINS=https://yourdomain.com,http://localhost:3000
REACT_APP_BACKEND_URL=https://yourdomain.com

# Optional API Keys
SENDGRID_API_KEY=your_sendgrid_key
TELEGRAM_BOT_TOKEN=your_telegram_token
EMERGENT_LLM_KEY=your_emergent_key
```

### 4. Запуск Development

```bash
# Запуск в development режиме
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

### 5. Запуск Production

```bash
# Создание необходимых директорий
mkdir -p ssl logs backups

# Запуск в production режиме
docker-compose -f docker-compose.prod.yml up -d

# Проверка
docker-compose -f docker-compose.prod.yml ps
```

## 🌐 Доступ к приложению

После запуска приложение будет доступно:

- **Frontend**: http://localhost:3000 (или ваш домен)
- **Backend API**: http://localhost:8001/api
- **API Documentation**: http://localhost:8001/docs

**Стандартный администратор:**
- Email: `admin@velesdrive.com`
- Пароль: `admin123`

## 🔧 Дополнительные команды

### Управление сервисами

```bash
# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Обновление образов
docker-compose pull
docker-compose up -d

# Просмотр логов отдельного сервиса
docker-compose logs -f backend
```

### Бэкапы

```bash
# Ручной бэкап
docker-compose -f docker-compose.prod.yml run --rm backup

# Автоматические бэкапы (добавить в crontab)
0 2 * * * cd /path/to/veles-drive && docker-compose -f docker-compose.prod.yml run --rm backup
```

### Мониторинг

```bash
# Использование ресурсов
docker stats

# Проверка health checks
docker-compose ps

# Размер volumes
docker system df
```

## 🔐 SSL/HTTPS настройка

### С Let's Encrypt (рекомендуется)

```bash
# Установка certbot
sudo apt install certbot

# Получение сертификата
sudo certbot certonly --standalone -d yourdomain.com

# Копирование сертификатов
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/

# Редактирование nginx конфигурации
nano docker/nginx-proxy.conf
# Раскомментировать SSL секции

# Перезапуск
docker-compose -f docker-compose.prod.yml restart nginx
```

### Автообновление сертификатов

```bash
# Добавить в crontab
0 12 * * * /usr/bin/certbot renew --quiet && cd /path/to/veles-drive && docker-compose -f docker-compose.prod.yml restart nginx
```

## 📊 Мониторинг и логи

### Просмотр логов

```bash
# Все сервисы
docker-compose logs -f

# Отдельный сервис
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Nginx логи (production)
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log
```

### Мониторинг производительности

```bash
# Статистика контейнеров
docker stats

# Использование дискового пространства
docker system df

# Очистка неиспользуемых данных
docker system prune -a
```

## 🔧 Troubleshooting

### Общие проблемы

**Порты заняты:**
```bash
sudo netstat -tulpn | grep :3000
sudo fuser -k 3000/tcp
```

**Проблемы с правами:**
```bash
sudo chown -R $USER:$USER .
chmod +x docker/backup.sh
```

**Проблемы с MongoDB:**
```bash
# Просмотр логов MongoDB
docker-compose logs mongodb

# Подключение к MongoDB
docker-compose exec mongodb mongosh -u admin -p
```

**Очистка и перезапуск:**
```bash
# Полная очистка (ВНИМАНИЕ: удалит все данные!)
docker-compose down -v
docker system prune -a
docker-compose up -d
```

### Обновление приложения

```bash
# 1. Создание бэкапа
docker-compose -f docker-compose.prod.yml run --rm backup

# 2. Остановка сервисов
docker-compose down

# 3. Обновление кода
git pull origin main
# или загрузка нового архива

# 4. Пересборка образов
docker-compose build --no-cache

# 5. Запуск
docker-compose -f docker-compose.prod.yml up -d
```

## 🔄 Миграция данных

### Экспорт данных

```bash
# Создание полного бэкапа
docker-compose exec mongodb mongodump --authenticationDatabase admin -u admin -p <password> --out /tmp/backup

# Копирование из контейнера
docker cp container_name:/tmp/backup ./mongodb-backup
```

### Импорт данных

```bash
# Копирование в контейнер
docker cp ./mongodb-backup container_name:/tmp/

# Восстановление
docker-compose exec mongodb mongorestore --authenticationDatabase admin -u admin -p <password> /tmp/mongodb-backup
```

## 📞 Поддержка

- **Документация API**: `/docs` endpoint
- **Логи**: `docker-compose logs`
- **Мониторинг**: `docker stats`

---

## ✅ Checklist для Production

- [ ] Изменены все пароли по умолчанию
- [ ] Настроен SSL сертификат
- [ ] Сконфигурированы бэкапы
- [ ] Настроен мониторинг
- [ ] Проверена firewall конфигурация
- [ ] Добавлены необходимые API ключи
- [ ] Протестированы все основные функции

**Готово к продакшену! 🎉**