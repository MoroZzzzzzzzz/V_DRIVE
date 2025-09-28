import os
import asyncio
import logging
from datetime import datetime, timezone
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes
from motor.motor_asyncio import AsyncIOMotorClient
import uuid
from typing import Optional, Dict, Any

# Configure logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

class VelesDriveTelegramBot:
    """VELES DRIVE Telegram Bot Implementation"""
    
    def __init__(self):
        self.bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        self.mongo_url = os.environ.get('MONGO_URL')
        self.backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        
        if not self.bot_token:
            logger.warning("TELEGRAM_BOT_TOKEN not found in environment variables")
            return
            
        # Initialize MongoDB connection
        self.client = AsyncIOMotorClient(self.mongo_url)
        self.db = self.client.veles_drive
        
        # Initialize bot application
        self.application = Application.builder().token(self.bot_token).build()
        self._setup_handlers()
    
    def _setup_handlers(self):
        """Setup bot command and message handlers"""
        # Command handlers
        self.application.add_handler(CommandHandler("start", self.start_command))
        self.application.add_handler(CommandHandler("help", self.help_command))
        self.application.add_handler(CommandHandler("search", self.search_command))
        self.application.add_handler(CommandHandler("favorites", self.favorites_command))
        self.application.add_handler(CommandHandler("profile", self.profile_command))
        self.application.add_handler(CommandHandler("notifications", self.notifications_command))
        self.application.add_handler(CommandHandler("connect", self.connect_command))
        self.application.add_handler(CommandHandler("disconnect", self.disconnect_command))
        
        # Callback query handler for inline keyboards
        self.application.add_handler(CallbackQueryHandler(self.button_callback))
        
        # Message handler for text messages
        self.application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, self.handle_message))
    
    async def start_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /start command"""
        try:
            chat_id = update.effective_chat.id
            user_data = update.effective_user
            
            # Check if user provided connection code
            if context.args:
                connection_code = context.args[0]
                await self.handle_account_connection(update, connection_code)
                return
            
            # Welcome message
            welcome_text = (
                "🚗 *Добро пожаловать в VELES DRIVE!*\n\n"
                "Я ваш персональный помощник для поиска автомобилей, мотоциклов, лодок и самолетов.\n\n"
                "*Что я умею:*\n"
                "🔍 Поиск транспорта по вашим критериям\n"
                "❤️ Управление избранными объявлениями\n"
                "🔔 Уведомления о новых предложениях\n"
                "👤 Информация о вашем профиле\n"
                "📊 Статистика просмотров\n\n"
                "*Доступные команды:*\n"
                "/help - список всех команд\n"
                "/search - поиск транспорта\n"
                "/favorites - ваши избранные\n"
                "/profile - информация о профиле\n"
                "/notifications - настройки уведомлений\n"
                "/connect - привязать аккаунт VELES DRIVE\n\n"
                "Для начала работы привяжите ваш аккаунт командой /connect"
            )
            
            keyboard = [
                [InlineKeyboardButton("🔗 Привязать аккаунт", callback_data="connect_account")],
                [InlineKeyboardButton("🔍 Поиск транспорта", callback_data="search_vehicles")],
                [InlineKeyboardButton("ℹ️ Помощь", callback_data="show_help")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(welcome_text, reply_markup=reply_markup, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error in start_command: {e}")
            await update.message.reply_text("Произошла ошибка. Попробуйте позже.")
    
    async def help_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /help command"""
        help_text = (
            "🆘 *VELES DRIVE - Помощь*\n\n"
            "*Основные команды:*\n"
            "/start - начать работу с ботом\n"
            "/help - показать это сообщение\n"
            "/search [тип] [марка] - поиск транспорта\n"
            "/favorites - показать избранные объявления\n"
            "/profile - информация о вашем профиле\n"
            "/notifications - настройки уведомлений\n"
            "/connect - привязать аккаунт VELES DRIVE\n"
            "/disconnect - отвязать аккаунт\n\n"
            "*Примеры поиска:*\n"
            "`/search BMW` - поиск BMW\n"
            "`/search motorcycle Harley` - поиск мотоциклов Harley\n"
            "`/search boat Azimut` - поиск лодок Azimut\n"
            "`/search plane Cessna` - поиск самолетов Cessna\n\n"
            "*Типы транспорта:*\n"
            "🚗 car (автомобили)\n"
            "🏍️ motorcycle (мотоциклы)\n"
            "🛥️ boat (лодки)\n"
            "✈️ plane (самолеты)\n\n"
            "Для получения персонализированных результатов привяжите ваш аккаунт VELES DRIVE."
        )
        
        keyboard = [
            [InlineKeyboardButton("🔍 Поиск", callback_data="search_vehicles")],
            [InlineKeyboardButton("🔗 Привязать аккаунт", callback_data="connect_account")]
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        
        await update.message.reply_text(help_text, reply_markup=reply_markup, parse_mode='Markdown')
    
    async def search_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /search command"""
        try:
            chat_id = update.effective_chat.id
            
            # Parse search arguments
            search_args = context.args
            vehicle_type = "car"  # default
            brand = ""
            
            if search_args:
                # Check if first arg is vehicle type
                if search_args[0].lower() in ['car', 'motorcycle', 'boat', 'plane']:
                    vehicle_type = search_args[0].lower()
                    if len(search_args) > 1:
                        brand = search_args[1]
                else:
                    brand = search_args[0]
            
            # Search in database
            search_results = await self.search_vehicles(vehicle_type, brand)
            
            if not search_results:
                type_emoji = {
                    'car': '🚗',
                    'motorcycle': '🏍️', 
                    'boat': '🛥️',
                    'plane': '✈️'
                }
                
                await update.message.reply_text(
                    f"{type_emoji.get(vehicle_type, '🚗')} Транспорт не найден.\n\n"
                    f"Попробуйте изменить критерии поиска или используйте /help для примеров."
                )
                return
            
            # Format and send results
            await self.send_search_results(update, search_results, vehicle_type, brand)
            
        except Exception as e:
            logger.error(f"Error in search_command: {e}")
            await update.message.reply_text("Ошибка поиска. Попробуйте позже.")
    
    async def favorites_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /favorites command"""
        try:
            chat_id = update.effective_chat.id
            
            # Get user from Telegram chat_id
            user = await self.get_user_by_telegram_id(chat_id)
            
            if not user:
                await update.message.reply_text(
                    "❌ Аккаунт не привязан.\n\n"
                    "Используйте /connect для привязки вашего аккаунта VELES DRIVE."
                )
                return
            
            # Get user's favorites
            favorites = await self.get_user_favorites(user['id'])
            
            if not favorites:
                await update.message.reply_text(
                    "💔 У вас пока нет избранных объявлений.\n\n"
                    "Добавляйте понравившиеся автомобили в избранное на сайте или через поиск в боте."
                )
                return
            
            # Send favorites list
            await self.send_favorites_list(update, favorites)
            
        except Exception as e:
            logger.error(f"Error in favorites_command: {e}")
            await update.message.reply_text("Ошибка получения избранного. Попробуйте позже.")
    
    async def profile_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /profile command"""
        try:
            chat_id = update.effective_chat.id
            
            # Get user from Telegram chat_id
            user = await self.get_user_by_telegram_id(chat_id)
            
            if not user:
                await update.message.reply_text(
                    "❌ Аккаунт не привязан.\n\n"
                    "Используйте /connect для привязки вашего аккаунта VELES DRIVE."
                )
                return
            
            # Format profile info
            role_names = {
                'buyer': '👤 Покупатель',
                'dealer': '🏪 Дилер', 
                'admin': '👑 Администратор'
            }
            
            profile_text = (
                f"👤 *Ваш профиль VELES DRIVE*\n\n"
                f"*Имя:* {user.get('full_name', 'Не указано')}\n"
                f"*Email:* {user.get('email', 'Не указано')}\n"
                f"*Роль:* {role_names.get(user.get('role'), 'Неизвестно')}\n"
                f"*Дата регистрации:* {self.format_date(user.get('created_at'))}\n"
                f"*2FA:* {'✅ Включена' if user.get('two_fa_enabled') else '❌ Отключена'}\n\n"
            )
            
            # Add role-specific info
            if user.get('role') == 'dealer':
                # Get dealer stats
                dealer_stats = await self.get_dealer_stats(user['id'])
                profile_text += (
                    f"📊 *Статистика дилера:*\n"
                    f"• Активные объявления: {dealer_stats.get('active_cars', 0)}\n"
                    f"• Всего продаж: {dealer_stats.get('total_sales', 0)}\n"
                    f"• Рейтинг: {dealer_stats.get('rating', 0):.1f}/5.0\n\n"
                )
            
            elif user.get('role') == 'buyer':
                # Get buyer stats
                buyer_stats = await self.get_buyer_stats(user['id'])
                profile_text += (
                    f"📊 *Ваша активность:*\n"
                    f"• Просмотров: {buyer_stats.get('total_views', 0)}\n"
                    f"• В избранном: {buyer_stats.get('favorites_count', 0)}\n"
                    f"• Сравнений: {buyer_stats.get('comparisons_count', 0)}\n\n"
                )
            
            keyboard = [
                [InlineKeyboardButton("🌐 Открыть сайт", url=f"{self.backend_url.replace(':8001', ':3000')}")],
                [InlineKeyboardButton("❤️ Избранное", callback_data="show_favorites")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(profile_text, reply_markup=reply_markup, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error in profile_command: {e}")
            await update.message.reply_text("Ошибка получения профиля. Попробуйте позже.")
    
    async def notifications_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /notifications command"""
        try:
            chat_id = update.effective_chat.id
            
            user = await self.get_user_by_telegram_id(chat_id)
            if not user:
                await update.message.reply_text(
                    "❌ Аккаунт не привязан.\n\n"
                    "Используйте /connect для привязки вашего аккаунта VELES DRIVE."
                )
                return
            
            # Get current notification settings
            notifications_enabled = user.get('telegram_notifications_enabled', True)
            
            text = (
                f"🔔 *Настройки уведомлений*\n\n"
                f"*Статус:* {'✅ Включены' if notifications_enabled else '❌ Отключены'}\n\n"
                f"*Типы уведомлений:*\n"
                f"• Новые автомобили по вашим критериям\n"
                f"• Изменения цен в избранном\n"
                f"• Обновления аукционов\n"
                f"• Сообщения от дилеров\n"
                f"• Системные уведомления\n\n"
                f"Используйте кнопки ниже для управления уведомлениями."
            )
            
            keyboard = [
                [InlineKeyboardButton(
                    "🔕 Отключить" if notifications_enabled else "🔔 Включить", 
                    callback_data=f"toggle_notifications_{user['id']}"
                )],
                [InlineKeyboardButton("⚙️ Детальные настройки", url=f"{self.backend_url.replace(':8001', ':3000')}/profile")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(text, reply_markup=reply_markup, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error in notifications_command: {e}")
            await update.message.reply_text("Ошибка настройки уведомлений. Попробуйте позже.")
    
    async def connect_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /connect command"""
        try:
            chat_id = update.effective_chat.id
            
            # Check if already connected
            existing_user = await self.get_user_by_telegram_id(chat_id)
            if existing_user:
                await update.message.reply_text(
                    f"✅ Аккаунт уже привязан!\n\n"
                    f"*Пользователь:* {existing_user.get('full_name')}\n"
                    f"*Email:* {existing_user.get('email')}\n\n"
                    f"Используйте /disconnect для отвязки аккаунта."
                )
                return
            
            # Generate connection code
            connection_code = str(uuid.uuid4())[:8].upper()
            
            # Store connection request
            await self.db.telegram_connections.insert_one({
                "connection_code": connection_code,
                "telegram_chat_id": chat_id,
                "telegram_user": {
                    "id": update.effective_user.id,
                    "username": update.effective_user.username,
                    "first_name": update.effective_user.first_name,
                    "last_name": update.effective_user.last_name
                },
                "created_at": datetime.now(timezone.utc).isoformat(),
                "expires_at": datetime.now(timezone.utc).isoformat(),
                "status": "pending"
            })
            
            connect_text = (
                f"🔗 *Привязка аккаунта VELES DRIVE*\n\n"
                f"*Код для привязки:* `{connection_code}`\n\n"
                f"*Инструкция:*\n"
                f"1. Перейдите на сайт VELES DRIVE\n"
                f"2. Войдите в ваш аккаунт\n"
                f"3. Откройте настройки профиля\n"
                f"4. Найдите раздел 'Telegram'\n"
                f"5. Введите код: `{connection_code}`\n"
                f"6. Нажмите 'Привязать'\n\n"
                f"⏰ Код действителен 10 минут.\n\n"
                f"После привязки вы сможете получать уведомления и управлять избранным через бот."
            )
            
            keyboard = [
                [InlineKeyboardButton("🌐 Открыть VELES DRIVE", url=f"{self.backend_url.replace(':8001', ':3000')}/profile")],
                [InlineKeyboardButton("🔄 Новый код", callback_data="generate_new_code")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(connect_text, reply_markup=reply_markup, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error in connect_command: {e}")
            await update.message.reply_text("Ошибка создания кода привязки. Попробуйте позже.")
    
    async def disconnect_command(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle /disconnect command"""
        try:
            chat_id = update.effective_chat.id
            
            user = await self.get_user_by_telegram_id(chat_id)
            if not user:
                await update.message.reply_text("❌ Аккаунт не привязан.")
                return
            
            # Remove telegram connection
            await self.db.users.update_one(
                {"id": user['id']},
                {"$unset": {"telegram_chat_id": "", "telegram_user": ""}}
            )
            
            await update.message.reply_text(
                "✅ Аккаунт успешно отвязан!\n\n"
                "Вы больше не будете получать уведомления через Telegram.\n"
                "Для повторной привязки используйте /connect"
            )
            
        except Exception as e:
            logger.error(f"Error in disconnect_command: {e}")
            await update.message.reply_text("Ошибка отвязки аккаунта. Попробуйте позже.")
    
    async def button_callback(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle inline keyboard button clicks"""
        try:
            query = update.callback_query
            await query.answer()
            
            data = query.data
            
            if data == "connect_account":
                await self.connect_command(update, context)
            elif data == "search_vehicles":
                await self.search_command(update, context)
            elif data == "show_help":
                await self.help_command(update, context)
            elif data == "show_favorites":
                await self.favorites_command(update, context)
            elif data.startswith("toggle_notifications_"):
                user_id = data.split("_")[-1]
                await self.toggle_notifications(query, user_id)
            elif data == "generate_new_code":
                await self.connect_command(update, context)
            
        except Exception as e:
            logger.error(f"Error in button_callback: {e}")
    
    async def handle_message(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        """Handle text messages"""
        try:
            text = update.message.text.lower()
            
            # Simple keyword responses
            if any(word in text for word in ['привет', 'hello', 'hi', 'старт']):
                await self.start_command(update, context)
            elif any(word in text for word in ['помощь', 'help', 'команды']):
                await self.help_command(update, context)
            elif any(word in text for word in ['поиск', 'найти', 'search']):
                await self.search_command(update, context)
            elif any(word in text for word in ['избранное', 'favorites', 'favorite']):
                await self.favorites_command(update, context)
            elif any(word in text for word in ['профиль', 'profile', 'аккаунт']):
                await self.profile_command(update, context)
            else:
                # Default response with suggestions
                await update.message.reply_text(
                    "🤔 Не понимаю команду.\n\n"
                    "Используйте /help для списка доступных команд или попробуйте:\n"
                    "• /search [марка] - поиск транспорта\n"
                    "• /favorites - избранное\n"
                    "• /profile - профиль"
                )
                
        except Exception as e:
            logger.error(f"Error in handle_message: {e}")
    
    # Helper methods
    async def search_vehicles(self, vehicle_type: str, brand: str = "") -> list:
        """Search vehicles in database"""
        try:
            query = {"vehicle_type": vehicle_type}
            if brand:
                query["brand"] = {"$regex": brand, "$options": "i"}
            
            # Limit to 10 results
            vehicles = await self.db.cars.find(query).limit(10).to_list(length=None)
            return vehicles
            
        except Exception as e:
            logger.error(f"Error searching vehicles: {e}")
            return []
    
    async def get_user_by_telegram_id(self, telegram_chat_id: int):
        """Get user by Telegram chat ID"""
        try:
            user = await self.db.users.find_one({"telegram_chat_id": telegram_chat_id})
            return user
        except Exception as e:
            logger.error(f"Error getting user by telegram ID: {e}")
            return None
    
    async def get_user_favorites(self, user_id: str) -> list:
        """Get user's favorite vehicles"""
        try:
            favorites = await self.db.favorites.find({"user_id": user_id}).to_list(length=None)
            
            # Get vehicle details for each favorite
            favorite_vehicles = []
            for fav in favorites:
                vehicle = await self.db.cars.find_one({"id": fav["car_id"]})
                if vehicle:
                    favorite_vehicles.append(vehicle)
            
            return favorite_vehicles
            
        except Exception as e:
            logger.error(f"Error getting user favorites: {e}")
            return []
    
    async def get_dealer_stats(self, user_id: str) -> dict:
        """Get dealer statistics"""
        try:
            active_cars = await self.db.cars.count_documents({"dealer_id": user_id, "status": "active"})
            
            # Mock stats for now
            return {
                "active_cars": active_cars,
                "total_sales": 0,
                "rating": 4.5
            }
        except Exception as e:
            logger.error(f"Error getting dealer stats: {e}")
            return {}
    
    async def get_buyer_stats(self, user_id: str) -> dict:
        """Get buyer statistics"""
        try:
            favorites_count = await self.db.favorites.count_documents({"user_id": user_id})
            views_count = await self.db.car_views.count_documents({"user_id": user_id})
            
            return {
                "total_views": views_count,
                "favorites_count": favorites_count,
                "comparisons_count": 0  # Mock for now
            }
        except Exception as e:
            logger.error(f"Error getting buyer stats: {e}")
            return {}
    
    async def send_search_results(self, update: Update, results: list, vehicle_type: str, brand: str):
        """Send formatted search results"""
        try:
            type_emoji = {
                'car': '🚗',
                'motorcycle': '🏍️', 
                'boat': '🛥️',
                'plane': '✈️'
            }
            
            header = f"{type_emoji.get(vehicle_type, '🚗')} *Результаты поиска*\n"
            if brand:
                header += f"*Марка:* {brand.title()}\n"
            header += f"*Найдено:* {len(results)} объявлений\n\n"
            
            await update.message.reply_text(header, parse_mode='Markdown')
            
            for vehicle in results[:5]:  # Show max 5 results
                await self.send_vehicle_card(update, vehicle)
                
        except Exception as e:
            logger.error(f"Error sending search results: {e}")
    
    async def send_vehicle_card(self, update: Update, vehicle: dict):
        """Send formatted vehicle card"""
        try:
            type_emoji = {
                'car': '🚗',
                'motorcycle': '🏍️', 
                'boat': '🛥️',
                'plane': '✈️'
            }
            
            emoji = type_emoji.get(vehicle.get('vehicle_type', 'car'), '🚗')
            
            card_text = (
                f"{emoji} *{vehicle.get('brand', 'Неизвестно')} {vehicle.get('model', '')}*\n"
                f"💰 *{vehicle.get('price', 0):,} ₽*\n"
                f"📅 Год: {vehicle.get('year', 'Не указан')}\n"
                f"🎨 Цвет: {vehicle.get('color', 'Не указан')}\n"
                f"📍 {vehicle.get('location', 'Местоположение не указано')}\n"
            )
            
            # Add type-specific info
            if vehicle.get('vehicle_type') in ['car', 'motorcycle'] and vehicle.get('mileage'):
                card_text += f"🛣 Пробег: {vehicle['mileage']:,} км\n"
            elif vehicle.get('vehicle_type') in ['boat', 'plane'] and vehicle.get('hours_operated'):
                card_text += f"⏱ Моточасы: {vehicle['hours_operated']:,}\n"
            
            if vehicle.get('engine_power'):
                card_text += f"⚡ Мощность: {vehicle['engine_power']} л.с.\n"
            
            keyboard = [
                [InlineKeyboardButton("👀 Подробнее", url=f"{self.backend_url.replace(':8001', ':3000')}/car/{vehicle.get('id')}")],
                [InlineKeyboardButton("❤️ В избранное", callback_data=f"add_favorite_{vehicle.get('id')}")]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            await update.message.reply_text(card_text, reply_markup=reply_markup, parse_mode='Markdown')
            
        except Exception as e:
            logger.error(f"Error sending vehicle card: {e}")
    
    async def send_favorites_list(self, update: Update, favorites: list):
        """Send user's favorites list"""
        try:
            header = f"❤️ *Ваши избранные объявления*\n*Всего:* {len(favorites)}\n\n"
            await update.message.reply_text(header, parse_mode='Markdown')
            
            for vehicle in favorites[:10]:  # Show max 10 favorites
                await self.send_vehicle_card(update, vehicle)
                
        except Exception as e:
            logger.error(f"Error sending favorites list: {e}")
    
    async def toggle_notifications(self, query, user_id: str):
        """Toggle user notifications"""
        try:
            user = await self.db.users.find_one({"id": user_id})
            if not user:
                await query.edit_message_text("❌ Пользователь не найден.")
                return
            
            current_state = user.get('telegram_notifications_enabled', True)
            new_state = not current_state
            
            await self.db.users.update_one(
                {"id": user_id},
                {"$set": {"telegram_notifications_enabled": new_state}}
            )
            
            status = "включены" if new_state else "отключены"
            await query.edit_message_text(f"✅ Уведомления {status}!")
            
        except Exception as e:
            logger.error(f"Error toggling notifications: {e}")
    
    async def handle_account_connection(self, update: Update, connection_code: str):
        """Handle account connection with code"""
        try:
            chat_id = update.effective_chat.id
            
            # Find connection request
            connection = await self.db.telegram_connections.find_one({
                "connection_code": connection_code,
                "status": "pending"
            })
            
            if not connection:
                await update.message.reply_text(
                    "❌ Неверный или истекший код подключения.\n\n"
                    "Получите новый код на сайте VELES DRIVE или используйте /connect"
                )
                return
            
            # Update connection status
            await self.db.telegram_connections.update_one(
                {"connection_code": connection_code},
                {"$set": {"status": "completed", "telegram_chat_id": chat_id}}
            )
            
            await update.message.reply_text(
                "✅ Аккаунт успешно привязан!\n\n"
                "Теперь вы можете:\n"
                "• Получать уведомления о новых объявлениях\n"
                "• Управлять избранным через бот\n"
                "• Просматривать информацию о профиле\n\n"
                "Используйте /help для списка команд."
            )
            
        except Exception as e:
            logger.error(f"Error handling account connection: {e}")
            await update.message.reply_text("Ошибка привязки аккаунта. Попробуйте позже.")
    
    def format_date(self, date_str: str) -> str:
        """Format date string for display"""
        try:
            if not date_str:
                return "Не указано"
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return date_obj.strftime("%d.%m.%Y")
        except:
            return "Не указано"
    
    async def start_bot(self):
        """Start the Telegram bot"""
        if not self.bot_token:
            logger.error("Cannot start bot: No TELEGRAM_BOT_TOKEN provided")
            return
        
        logger.info("Starting VELES DRIVE Telegram Bot...")
        await self.application.run_polling()
    
    async def stop_bot(self):
        """Stop the Telegram bot"""
        if self.application:
            await self.application.stop()
        if self.client:
            self.client.close()

# Main execution
if __name__ == "__main__":
    bot = VelesDriveTelegramBot()
    asyncio.run(bot.start_bot())