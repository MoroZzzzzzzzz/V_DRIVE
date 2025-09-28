# VELES DRIVE Makefile - Упрощенное управление Docker окружением

.PHONY: help build up down restart logs clean backup restore status

# Default target
help: ## Показать справку по командам
	@echo "VELES DRIVE - Docker Management Commands"
	@echo "========================================"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Development commands
build: ## Собрать все Docker образы
	docker-compose build

up: ## Запустить все сервисы в development режиме
	docker-compose up -d

up-logs: ## Запустить с выводом логов
	docker-compose up

down: ## Остановить все сервисы
	docker-compose down

restart: ## Перезапустить все сервисы
	docker-compose restart

logs: ## Показать логи всех сервисов
	docker-compose logs -f

status: ## Показать статус всех сервисов
	docker-compose ps

# Production commands
prod-build: ## Собрать образы для production
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Запустить в production режиме
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Остановить production
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Логи production
	docker-compose -f docker-compose.prod.yml logs -f

prod-status: ## Статус production
	docker-compose -f docker-compose.prod.yml ps

# Database commands
backup: ## Создать бэкап базы данных
	docker-compose -f docker-compose.prod.yml run --rm backup

db-shell: ## Подключиться к MongoDB shell
	docker-compose exec mongodb mongosh -u admin -p

db-logs: ## Показать логи MongoDB
	docker-compose logs -f mongodb

# Maintenance commands
clean: ## Очистить неиспользуемые Docker ресурсы
	docker system prune -f
	docker volume prune -f

clean-all: ## Полная очистка (ОСТОРОЖНО!)
	@echo "⚠️  Это удалит ВСЕ Docker данные! Нажмите Ctrl+C для отмены..."
	@sleep 5
	docker-compose down -v
	docker system prune -a -f

update: ## Обновить и перезапустить сервисы
	git pull
	docker-compose build --no-cache
	docker-compose up -d

# Individual service management
backend-logs: ## Логи backend сервиса
	docker-compose logs -f backend

frontend-logs: ## Логи frontend сервиса
	docker-compose logs -f frontend

backend-shell: ## Войти в backend контейнер
	docker-compose exec backend /bin/bash

frontend-shell: ## Войти в frontend контейнер
	docker-compose exec frontend /bin/sh

# Health checks
health: ## Проверить здоровье всех сервисов
	@echo "🔍 Проверка сервисов VELES DRIVE..."
	@curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000/ || echo "Frontend: ❌ Недоступен"
	@curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8001/api/ || echo "Backend: ❌ Недоступен"
	@docker-compose ps

# SSL/Certificate management
ssl-renew: ## Обновить SSL сертификаты
	sudo certbot renew --quiet
	docker-compose -f docker-compose.prod.yml restart nginx

# Development helpers
dev-setup: ## Первоначальная настройка для разработки
	@echo "🚀 Настройка VELES DRIVE для разработки..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "📋 Создан .env файл - настройте его!"; fi
	@mkdir -p ssl logs backups
	@echo "✅ Готово! Запустите 'make up' для старта"

prod-setup: ## Настройка для production
	@echo "🚀 Настройка VELES DRIVE для production..."
	@if [ ! -f .env ]; then echo "❌ Создайте .env файл из .env.example!"; exit 1; fi
	@mkdir -p ssl logs backups
	@echo "⚠️  Настройте SSL сертификаты и домен в .env"
	@echo "✅ Готово! Запустите 'make prod-up' для старта"

# Monitoring
monitor: ## Показать использование ресурсов
	docker stats --no-stream

disk-usage: ## Показать использование диска Docker
	docker system df