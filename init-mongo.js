// Упрощенная инициализация MongoDB для VELES DRIVE
print('🚀 Инициализация VELES DRIVE database...');

// Подключение к базе данных
db = db.getSiblingDB('veles_drive');

// Создание основных индексов для производительности
print('📊 Создание индексов...');

// Users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });

// Cars  
db.cars.createIndex({ "brand": 1 });
db.cars.createIndex({ "price": 1 });
db.cars.createIndex({ "dealer_id": 1 });

// Reviews
db.reviews.createIndex({ "dealer_id": 1 });

// Auctions
db.auctions.createIndex({ "status": 1 });
db.auctions.createIndex({ "end_time": 1 });

print('✅ Индексы созданы');

// Создание администратора по умолчанию
if (db.users.countDocuments() === 0) {
    print('👤 Создание администратора по умолчанию...');
    
    // Простой хеш для admin123 (в продакшене используйте bcrypt)
    db.users.insertOne({
        id: 'admin-default-id',
        email: 'admin@velesdrive.com',
        password_hash: '$2b$12$LQv3c1yqBjlSfH8D.hxOgeJz/DoYjh7mGJM5l7wQ8.GJmKVg6ePJi',
        full_name: 'VELES DRIVE Admin',
        phone: '+7900000000',
        role: 'admin',
        is_active: true,
        two_fa_enabled: false,
        created_at: new Date()
    });
    
    print('✅ Администратор создан: admin@velesdrive.com / admin123');
}

print('🎉 Инициализация завершена!');