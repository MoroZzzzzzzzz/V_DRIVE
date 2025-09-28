# 🚀 VELES DRIVE - Быстрый деплой

## Автоматическая установка на VPS

### 1️⃣ Скачайте проект

```bash
# Клонирование из GitHub
git clone https://github.com/your-username/veles-drive.git
cd veles-drive

# ИЛИ скачивание архива
wget https://github.com/your-username/veles-drive/archive/main.zip
unzip main.zip
cd veles-drive-main
```

### 2️⃣ Запустите автоустановку

```bash
# Сделайте скрипт исполняемым
chmod +x deploy.sh

# Запустите автоматическую установку
./deploy.sh
```

**Скрипт автоматически:**
- ✅ Установит Docker и Docker Compose
- ✅ Создаст все необходимые конфигурации  
- ✅ Сгенерирует безопасные пароли
- ✅ Запустит все сервисы
- ✅ Проверит работоспособность

### 3️⃣ Готово!

После установки сайт будет доступен:
- **Frontend**: http://YOUR_IP:3000
- **Backend API**: http://YOUR_IP:8001/api

**Администратор по умолчанию:**
- Email: `admin@velesdrive.com`
- Пароль: `admin123`

---

## 🔧 Управление проектом

### Основные команды

```bash
./deploy.sh          # Интерактивное меню управления
docker-compose ps    # Статус сервисов
docker-compose logs  # Логи всех сервисов
docker-compose down  # Остановка
docker-compose up -d # Запуск
```

### Если что-то пошло не так

```bash
# Полная переустановка
docker-compose down -v
docker system prune -f
./deploy.sh
```

---

## 📋 Минимальные требования

- **VPS**: 2GB RAM, 1 CPU, 10GB диска
- **OS**: Ubuntu 18.04+, Debian 10+, CentOS 8+
- **Порты**: 3000, 8001, 27017

---

## 🆘 Troubleshooting

### Порты заняты
```bash
sudo netstat -tlnp | grep :3000
sudo fuser -k 3000/tcp
```

### Docker проблемы
```bash
sudo systemctl restart docker
sudo usermod -aG docker $USER
newgrp docker
```

### Проблемы с памятью
```bash
# Увеличить swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Логи для диагностики
```bash
docker-compose logs backend
docker-compose logs frontend  
docker-compose logs mongodb
```

---

## 📞 Поддержка

Если автоматический деплой не работает:

1. Запустите: `./deploy.sh` и выберите "Показать логи"
2. Скопируйте вывод ошибок
3. Проверьте порты: `sudo netstat -tlnp | grep -E ':(3000|8001|27017)'`
4. Проверьте Docker: `docker --version && docker-compose --version`

**Проект гарантированно работает на:**
- ✅ Ubuntu 20.04/22.04
- ✅ Debian 11/12  
- ✅ CentOS 8/9
- ✅ VPS с 2GB+ RAM

---

**Готово к использованию за 5 минут! 🎉**