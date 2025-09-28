#!/bin/bash
# VELES DRIVE - Быстрый деплой для Cursor AI
# Супер простая версия без сложных проверок

echo "🚀 VELES DRIVE Quick Deploy"
echo "=========================="

# Остановка на ошибках
set -e

# Установка Docker если не установлен
if ! command -v docker &> /dev/null; then
    echo "📦 Установка Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker установлен. Перезапустите терминал и запустите скрипт снова."
    exit 0
fi

# Установка Docker Compose если не установлен
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "📦 Установка Docker Compose..."
    sudo apt update
    sudo apt install -y docker-compose-plugin python3-pip
    sudo pip3 install docker-compose
fi

# Создание базового .env если его нет
if [ ! -f .env ]; then
    echo "⚙️  Создание конфигурации..."
    
    # Получение IP сервера
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
    
    cat > .env << EOF
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=velespass123
DB_NAME=veles_drive
SECRET_KEY=veles-secret-key-$(date +%s)
JWT_SECRET=veles-jwt-secret-$(date +%s)
CORS_ORIGINS=http://localhost:3000,http://${SERVER_IP}:3000
REACT_APP_BACKEND_URL=http://${SERVER_IP}:8001
EXTERNAL_IP=${SERVER_IP}
EOF
    echo "✅ Конфигурация создана для IP: $SERVER_IP"
fi

# Создание упрощенного docker-compose.yml
echo "📝 Создание Docker конфигурации..."
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: veles_mongo
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASSWORD}
      MONGO_INITDB_DATABASE: ${DB_NAME}
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
      - ./init-mongo.js:/docker-entrypoint-initdb.d/init.js:ro
    command: --auth

  backend:
    build:
      context: .
      dockerfile: Dockerfile.simple
      target: backend
    container_name: veles_backend
    restart: unless-stopped
    environment:
      - MONGO_URL=mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongodb:27017/${DB_NAME}?authSource=admin
      - DB_NAME=${DB_NAME}
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
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
        - REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}
    container_name: veles_frontend
    restart: unless-stopped
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  mongo_data:
EOF

# Остановка существующих контейнеров
echo "🛑 Остановка существующих сервисов..."
docker-compose down 2>/dev/null || true

# Очистка портов
sudo fuser -k 3000/tcp 2>/dev/null || true
sudo fuser -k 8001/tcp 2>/dev/null || true
sudo fuser -k 27017/tcp 2>/dev/null || true

# Сборка и запуск
echo "🏗️  Сборка проекта..."
docker-compose build --no-cache

echo "🚀 Запуск сервисов..."
docker-compose up -d

# Ожидание запуска
echo "⏳ Ожидание запуска сервисов (60 секунд)..."
sleep 60

# Проверка статуса
echo "📊 Проверка статуса..."
docker-compose ps

# Получение IP и вывод результатов
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

echo ""
echo "🎉 VELES DRIVE успешно развернут!"
echo "================================="
echo "Frontend:  http://${SERVER_IP}:3000"
echo "Backend:   http://${SERVER_IP}:8001/api/"
echo ""
echo "👤 Администратор:"
echo "   Email: admin@velesdrive.com"  
echo "   Пароль: admin123"
echo ""
echo "📋 Управление:"
echo "   Логи:      docker-compose logs"
echo "   Остановка: docker-compose down"  
echo "   Запуск:    docker-compose up -d"
echo ""

# Проверка доступности
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend работает"
else
    echo "⚠️  Frontend может быть еще не готов, подождите 1-2 минуты"
fi

if curl -s http://localhost:8001/api/ > /dev/null 2>&1; then
    echo "✅ Backend работает"
else
    echo "⚠️  Backend может быть еще не готов, подождите 1-2 минуты"  
fi

echo ""
echo "🔗 Откройте в браузере: http://${SERVER_IP}:3000"