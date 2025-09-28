# 🤖 ИНСТРУКЦИИ ДЛЯ CURSOR AI - VELES DRIVE DEPLOY

## Простая команда для разворачивания

**Cursor AI, выполни эти команды по порядку:**

```bash
# 1. Обновить систему
sudo apt update && sudo apt upgrade -y

# 2. Запустить автоматический деплой
chmod +x deploy.sh
./deploy.sh
```

**Выбери пункт "1" (Полная установка и запуск)**

---

## Если возникают ошибки

### Проблема с Docker
```bash
# Установка Docker вручную
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Установка Docker Compose
sudo apt install docker-compose-plugin -y
```

### Проблема с портами
```bash
# Остановка служб на портах 3000, 8001
sudo fuser -k 3000/tcp 8001/tcp 27017/tcp
```

### Использование альтернативного compose файла
```bash
# Если основной docker-compose.yml не работает
cp docker-compose.simple.yml docker-compose.yml
docker-compose up -d
```

---

## Минимальная ручная установка

Если автоскрипт не работает, выполни это:

```bash
# 1. Создать .env
cat > .env << 'EOF'
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=secure_password_123
DB_NAME=veles_drive
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
CORS_ORIGINS=http://localhost:3000
REACT_APP_BACKEND_URL=http://localhost:8001
EOF

# 2. Создать упрощенный docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: veles_mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secure_password_123
      MONGO_INITDB_DATABASE: veles_drive
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    command: --auth

  backend:
    build:
      context: .
      dockerfile: Dockerfile.simple
      target: backend
    container_name: veles_backend
    restart: unless-stopped
    environment:
      - MONGO_URL=mongodb://admin:secure_password_123@mongodb:27017/veles_drive?authSource=admin
      - DB_NAME=veles_drive
      - SECRET_KEY=your-secret-key-here
      - JWT_SECRET=your-jwt-secret-here
      - CORS_ORIGINS=http://localhost:3000
    ports:
      - "8001:8001"
    depends_on:
      - mongodb

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.simple
      target: frontend
      args:
        - REACT_APP_BACKEND_URL=http://localhost:8001
    container_name: veles_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongo_data:
EOF

# 3. Запустить
docker-compose up -d
```

---

## Проверка результата

После запуска проверь:

```bash
# Статус контейнеров
docker-compose ps

# Логи если есть проблемы
docker-compose logs

# Проверка доступности
curl http://localhost:3000
curl http://localhost:8001/api/
```

**Результат:**
- Frontend: http://SERVER_IP:3000
- Backend API: http://SERVER_IP:8001/api/
- Админ: admin@velesdrive.com / admin123

---

## Возможные ошибки и решения

### "Permission denied"
```bash
sudo chmod +x deploy.sh
sudo chown -R $USER:$USER .
```

### "Port already in use"
```bash
sudo netstat -tlnp | grep :3000
sudo fuser -k 3000/tcp
```

### "Docker not found"
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### "Build failed"
```bash
docker system prune -f
docker-compose build --no-cache
```

### "Cannot connect to MongoDB"
```bash
docker-compose restart mongodb
docker-compose logs mongodb
```

---

## Cursor AI - Пошаговый алгоритм

1. **Клонируй** репозиторий или убедись что ты в папке проекта
2. **Запусти** `./deploy.sh` 
3. **Выбери** пункт 1 (полная установка)
4. **Дождись** завершения (5-10 минут)
5. **Проверь** статус через `docker-compose ps`
6. **Открой** браузер на http://SERVER_IP:3000

**Если ошибки - используй минимальную ручную установку выше.**

**ВАЖНО:** Все файлы уже готовы в проекте, просто выполни команды!