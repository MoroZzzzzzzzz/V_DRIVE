#!/bin/bash
# Скрипт для создания бэкапов MongoDB

set -e

# Конфигурация
BACKUP_DIR="/backups"
MONGO_HOST="${MONGO_HOST:-mongodb}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_USER="${MONGO_ROOT_USER}"
MONGO_PASS="${MONGO_ROOT_PASSWORD}"
DB_NAME="${DB_NAME:-veles_drive}"

# Создание имени файла с датой
BACKUP_NAME="veles_backup_$(date +%Y%m%d_%H%M%S)"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo "🚀 Starting backup of VELES DRIVE database..."
echo "📅 Backup time: $(date)"
echo "💾 Backup name: ${BACKUP_NAME}"

# Создание бэкапа
mongodump \
    --host "${MONGO_HOST}:${MONGO_PORT}" \
    --username "${MONGO_USER}" \
    --password "${MONGO_PASS}" \
    --db "${DB_NAME}" \
    --authenticationDatabase admin \
    --out "${BACKUP_PATH}"

# Сжатие бэкапа
echo "🗜️  Compressing backup..."
cd "${BACKUP_DIR}"
tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
rm -rf "${BACKUP_NAME}"

# Удаление старых бэкапов (старше 30 дней)
echo "🧹 Cleaning old backups..."
find "${BACKUP_DIR}" -name "veles_backup_*.tar.gz" -mtime +30 -delete

echo "✅ Backup completed successfully!"
echo "📁 Backup location: ${BACKUP_PATH}.tar.gz"
echo "💿 Backup size: $(du -h ${BACKUP_PATH}.tar.gz | cut -f1)"