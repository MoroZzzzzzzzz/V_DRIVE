// MongoDB initialization script for VELES DRIVE
print('🚀 Initializing VELES DRIVE database...');

// Создание индексов для оптимизации производительности
db = db.getSiblingDB('veles_drive');

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "phone": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
db.users.createIndex({ "is_active": 1 });
db.users.createIndex({ "created_at": 1 });

// Cars collection indexes
db.cars.createIndex({ "brand": 1 });
db.cars.createIndex({ "model": 1 });
db.cars.createIndex({ "year": 1 });
db.cars.createIndex({ "price": 1 });
db.cars.createIndex({ "vehicle_type": 1 });
db.cars.createIndex({ "dealer_id": 1 });
db.cars.createIndex({ "is_active": 1 });
db.cars.createIndex({ "created_at": 1 });

// Reviews collection indexes
db.reviews.createIndex({ "dealer_id": 1 });
db.reviews.createIndex({ "user_id": 1 });
db.reviews.createIndex({ "rating": 1 });
db.reviews.createIndex({ "created_at": 1 });

// Auctions collection indexes
db.auctions.createIndex({ "car_id": 1 });
db.auctions.createIndex({ "status": 1 });
db.auctions.createIndex({ "end_time": 1 });
db.auctions.createIndex({ "created_at": 1 });

// Bids collection indexes
db.bids.createIndex({ "auction_id": 1 });
db.bids.createIndex({ "user_id": 1 });
db.bids.createIndex({ "amount": 1 });
db.bids.createIndex({ "created_at": 1 });

// Transactions collection indexes
db.transactions.createIndex({ "user_id": 1 });
db.transactions.createIndex({ "car_id": 1 });
db.transactions.createIndex({ "status": 1 });
db.transactions.createIndex({ "created_at": 1 });

// Notifications collection indexes
db.notifications.createIndex({ "user_id": 1 });
db.notifications.createIndex({ "is_read": 1 });
db.notifications.createIndex({ "created_at": 1 });

// Projects collection indexes (ERP)
db.projects.createIndex({ "dealer_id": 1 });
db.projects.createIndex({ "status": 1 });
db.projects.createIndex({ "created_at": 1 });

// Telegram connections indexes
db.telegram_connections.createIndex({ "user_id": 1 }, { unique: true });
db.telegram_connections.createIndex({ "telegram_id": 1 }, { unique: true });
db.telegram_connections.createIndex({ "connection_code": 1 });
db.telegram_connections.createIndex({ "expires_at": 1 });

print('✅ Database indexes created successfully!');

// Создание базового администратора (только если нет пользователей)
if (db.users.countDocuments() === 0) {
    print('📝 Creating default admin user...');
    
    // Хеш пароля для "admin123" (используйте реальный хеш в продакшене)
    const adminUser = {
        id: 'admin-default-user-id',
        email: 'admin@velesdrive.com',
        password_hash: '$2b$12$LQv3c1yqBjlSfH8D.hxOgeJz/DoYjh7mGJM5l7wQ8.GJmKVg6ePJi', // admin123
        full_name: 'VELES DRIVE Administrator',
        phone: '+7900000000',
        role: 'admin',
        is_active: true,
        two_fa_enabled: false,
        created_at: new Date(),
        login_attempts: 0
    };
    
    db.users.insertOne(adminUser);
    print('✅ Default admin user created: admin@velesdrive.com / admin123');
} else {
    print('ℹ️  Users already exist, skipping admin creation');
}

print('🎉 VELES DRIVE database initialization completed!');