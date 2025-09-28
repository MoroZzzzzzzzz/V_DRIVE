#!/bin/bash
# VELES DRIVE - Автоматический деплой на VPS
# Этот скрипт автоматически разворачивает проект без сложных настроек

set -e

echo "🚀 VELES DRIVE - Автоматический деплой"
echo "======================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка root прав
if [[ $EUID -eq 0 ]]; then
   print_error "Не запускайте скрипт от root! Используйте обычного пользователя."
   exit 1
fi

# Обнаружение ОС
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    DISTRO=$ID
else
    print_error "Не удалось определить операционную систему"
    exit 1
fi

print_status "Операционная система: $OS"

# Функция установки Docker
install_docker() {
    print_status "Установка Docker..."
    
    # Удаление старых версий
    sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Обновление пакетов
    sudo apt-get update
    
    # Установка зависимостей
    sudo apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release \
        software-properties-common
    
    # Добавление Docker репозитория
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Добавление пользователя в группу docker
    sudo usermod -aG docker $USER
    
    print_status "Docker установлен успешно"
}

# Функция установки Docker Compose
install_docker_compose() {
    print_status "Установка Docker Compose..."
    
    # Установка через pip как fallback
    if ! command -v docker-compose &> /dev/null; then
        sudo apt-get install -y python3-pip
        sudo pip3 install docker-compose
    fi
    
    print_status "Docker Compose установлен"
}

# Проверка Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_warning "Docker не найден. Устанавливаю..."
        install_docker
        
        # Перезапуск для применения группы docker
        print_warning "Необходимо перезапустить сессию. Выполните команду:"
        print_warning "newgrp docker && ./deploy.sh"
        exit 0
    fi
    
    if ! docker ps &> /dev/null; then
        print_warning "Docker daemon не запущен. Запускаю..."
        sudo systemctl start docker
        sudo systemctl enable docker
    fi
    
    print_status "Docker готов к работе"
}

# Проверка Docker Compose
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_warning "Docker Compose не найден. Устанавливаю..."
        install_docker_compose
    fi
    
    print_status "Docker Compose готов к работе"
}

# Создание конфигурационных файлов
setup_config() {
    print_status "Создание конфигурационных файлов..."
    
    # Создание .env если не существует
    if [ ! -f .env ]; then
        print_status "Создание .env файла с автонастройкой..."
        
        # Генерация случайных паролей
        MONGO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        SECRET_KEY=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
        JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
        
        # Получение внешнего IP
        EXTERNAL_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "localhost")
        
        cat > .env << EOF
# VELES DRIVE - Автоматически сгенерированная конфигурация
# Сгенерировано: $(date)

# Database Configuration
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=${MONGO_PASSWORD}
DB_NAME=veles_drive

# Security Keys
SECRET_KEY=${SECRET_KEY}
JWT_SECRET=${JWT_SECRET}

# Network Configuration  
EXTERNAL_IP=${EXTERNAL_IP}
CORS_ORIGINS=http://localhost:3000,http://${EXTERNAL_IP}:3000,https://${EXTERNAL_IP}
REACT_APP_BACKEND_URL=http://${EXTERNAL_IP}:8001

# Optional API Keys (добавьте при необходимости)
SENDGRID_API_KEY=
TELEGRAM_BOT_TOKEN=
EMERGENT_LLM_KEY=

# Production settings
DOMAIN=${EXTERNAL_IP}
SSL_EMAIL=admin@${EXTERNAL_IP}
EOF
        
        print_status ".env файл создан с IP: $EXTERNAL_IP"
        print_warning "Отредактируйте .env файл если нужно изменить настройки"
    fi
    
    # Создание необходимых директорий
    mkdir -p logs ssl backups uploads
    chmod 755 logs ssl backups uploads
    
    print_status "Конфигурация готова"
}

# Функция запуска проекта
start_project() {
    print_status "Запуск VELES DRIVE..."
    
    # Остановка существующих контейнеров
    docker-compose down 2>/dev/null || true
    
    # Сборка и запуск
    docker-compose build
    docker-compose up -d
    
    # Ожидание запуска сервисов
    print_status "Ожидание запуска сервисов..."
    sleep 30
    
    # Проверка статуса
    docker-compose ps
    
    print_status "Проект запущен!"
}

# Функция проверки статуса
check_status() {
    print_status "Проверка статуса сервисов..."
    
    # Проверка контейнеров
    if [ "$(docker-compose ps -q | wc -l)" -eq 0 ]; then
        print_error "Контейнеры не запущены"
        return 1
    fi
    
    # Проверка портов
    sleep 10
    
    if curl -s http://localhost:3000 > /dev/null; then
        print_status "Frontend доступен: http://localhost:3000"
    else
        print_warning "Frontend недоступен на порту 3000"
    fi
    
    if curl -s http://localhost:8001/api/ > /dev/null; then
        print_status "Backend доступен: http://localhost:8001/api/"
    else
        print_warning "Backend недоступен на порту 8001"
    fi
    
    # Получение внешнего IP
    EXTERNAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
    
    print_status "Внешний доступ:"
    echo "  Frontend: http://$EXTERNAL_IP:3000"
    echo "  Backend:  http://$EXTERNAL_IP:8001/api/"
    echo ""
    print_status "Стандартный администратор:"
    echo "  Email: admin@velesdrive.com"
    echo "  Пароль: admin123"
}

# Функция показа логов
show_logs() {
    print_status "Последние логи сервисов:"
    docker-compose logs --tail=50
}

# Функция остановки
stop_project() {
    print_status "Остановка VELES DRIVE..."
    docker-compose down
    print_status "Проект остановлен"
}

# Главное меню
main_menu() {
    echo ""
    echo "Выберите действие:"
    echo "1. 🚀 Полная установка и запуск"
    echo "2. ▶️  Запустить существующий проект"  
    echo "3. ⏹️  Остановить проект"
    echo "4. 📊 Проверить статус"
    echo "5. 📋 Показать логи"
    echo "6. 🔄 Перезапустить"
    echo "7. ❌ Выход"
    echo ""
    
    read -p "Ваш выбор (1-7): " choice
    
    case $choice in
        1)
            print_status "Начинаю полную установку..."
            check_docker
            check_docker_compose
            setup_config
            start_project
            check_status
            ;;
        2)
            start_project
            check_status
            ;;
        3)
            stop_project
            ;;
        4)
            check_status
            ;;
        5)
            show_logs
            ;;
        6)
            print_status "Перезапуск проекта..."
            docker-compose restart
            check_status
            ;;
        7)
            print_status "До свидания!"
            exit 0
            ;;
        *)
            print_error "Неверный выбор. Попробуйте снова."
            main_menu
            ;;
    esac
}

# Запуск главного меню
main_menu