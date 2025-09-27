import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from telegram import Bot
import asyncio
import httpx
from typing import Optional, Dict, List
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Email service using SendGrid for VELES DRIVE platform"""
    
    def __init__(self):
        self.api_key = os.environ.get('SENDGRID_API_KEY')
        self.from_email = os.environ.get('SENDER_EMAIL', 'noreply@velesdrive.com')
        self.client = None
        
        if self.api_key:
            self.client = SendGridAPIClient(api_key=self.api_key)
    
    async def send_email(self, to_email: str, subject: str, html_content: str, plain_content: Optional[str] = None):
        """Send email via SendGrid"""
        
        if not self.client:
            logger.warning("SendGrid client not configured - email not sent")
            return False
            
        try:
            message = Mail(
                from_email=self.from_email,
                to_emails=to_email,
                subject=subject,
                html_content=html_content,
                plain_text_content=plain_content
            )
            
            response = self.client.send(message)
            return response.status_code == 202
            
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False
    
    async def send_auction_notification(self, user_email: str, auction_id: str, car_details: Dict):
        """Send auction notification email"""
        
        subject = f"New Bid on {car_details['brand']} {car_details['model']}"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 20px; border-radius: 8px;">
                <h1 style="color: #D4AF37;">VELES DRIVE</h1>
                <h2>Auction Update</h2>
                <p>There's been a new bid on the vehicle you're watching:</p>
                
                <div style="background-color: #2a2a2a; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h3 style="color: #D4AF37;">{car_details['brand']} {car_details['model']} ({car_details['year']})</h3>
                    <p><strong>Current Price:</strong> {car_details['current_price']:,} RUB</p>
                    <p><strong>Auction ID:</strong> {auction_id}</p>
                </div>
                
                <p>Visit the platform to place your bid!</p>
                <a href="https://velesdrive.com/auctions/{auction_id}" 
                   style="display: inline-block; background-color: #D4AF37; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   View Auction
                </a>
                
                <p style="margin-top: 30px; color: #888; font-size: 12px;">
                    You received this because you're following this auction. 
                    <a href="https://velesdrive.com/unsubscribe" style="color: #D4AF37;">Unsubscribe</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(user_email, subject, html_content)
    
    async def send_review_notification(self, dealer_email: str, reviewer_name: str, rating: int, comment: str):
        """Send new review notification to dealer"""
        
        subject = "New Review for Your Dealership - VELES DRIVE"
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; padding: 20px; border-radius: 8px;">
                <h1 style="color: #D4AF37;">VELES DRIVE</h1>
                <h2>New Customer Review</h2>
                <p>You have received a new review from a customer:</p>
                
                <div style="background-color: #2a2a2a; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Reviewer:</strong> {reviewer_name}</p>
                    <p><strong>Rating:</strong> {'⭐' * rating} ({rating}/5)</p>
                    {f'<p><strong>Comment:</strong> {comment}</p>' if comment else ''}
                </div>
                
                <p>Respond to your customers through the VELES DRIVE platform to build stronger relationships!</p>
                <a href="https://velesdrive.com/erp/reviews" 
                   style="display: inline-block; background-color: #D4AF37; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                   Manage Reviews
                </a>
            </div>
        </body>
        </html>
        """
        
        return await self.send_email(dealer_email, subject, html_content)

class TelegramService:
    """Telegram bot service for VELES DRIVE platform"""
    
    def __init__(self):
        self.bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        self.bot = None
        
        if self.bot_token:
            self.bot = Bot(token=self.bot_token)
    
    async def send_message(self, chat_id: int, message: str, parse_mode: str = "HTML"):
        """Send message via Telegram bot"""
        
        if not self.bot:
            logger.warning("Telegram bot not configured - message not sent")
            return False
            
        try:
            await self.bot.send_message(
                chat_id=chat_id,
                text=message,
                parse_mode=parse_mode
            )
            return True
            
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False
    
    async def send_car_alert(self, chat_id: int, car_details: Dict):
        """Send new car alert via Telegram"""
        
        message = f"""
🚗 <b>Новый автомобиль на VELES DRIVE!</b>

<b>{car_details['brand']} {car_details['model']}</b> ({car_details['year']})
💰 Цена: <b>{car_details['price']:,} RUB</b>
📍 Локация: {car_details.get('location', 'Не указана')}
🏢 Дилер: {car_details.get('dealer_name', 'Не указан')}

{car_details.get('description', '')[:200]}...

<a href="https://velesdrive.com/car/{car_details['id']}">Посмотреть автомобиль</a>
        """
        
        return await self.send_message(chat_id, message)
    
    async def send_auction_update(self, chat_id: int, auction_details: Dict):
        """Send auction update via Telegram"""
        
        message = f"""
🔥 <b>Обновление аукциона!</b>

<b>{auction_details['car_brand']} {auction_details['car_model']}</b>
💵 Текущая ставка: <b>{auction_details['current_price']:,} RUB</b>
⏰ До окончания: {auction_details['time_remaining']}

<a href="https://velesdrive.com/auctions/{auction_details['id']}">Сделать ставку</a>
        """
        
        return await self.send_message(chat_id, message)

class NotificationService:
    """Unified notification service for VELES DRIVE platform"""
    
    def __init__(self):
        self.email_service = EmailService()
        self.telegram_service = TelegramService()
    
    async def notify_new_bid(self, auction_id: str, car_details: Dict, users: List[Dict]):
        """Notify users about new auction bids"""
        
        tasks = []
        
        for user in users:
            # Send email notification
            if user.get('email'):
                task = self.email_service.send_auction_notification(
                    user['email'], auction_id, car_details
                )
                tasks.append(task)
            
            # Send Telegram notification
            if user.get('telegram_chat_id'):
                auction_details = {
                    'id': auction_id,
                    'car_brand': car_details['brand'],
                    'car_model': car_details['model'],
                    'current_price': car_details['current_price'],
                    'time_remaining': car_details.get('time_remaining', 'Неизвестно')
                }
                task = self.telegram_service.send_auction_update(
                    user['telegram_chat_id'], auction_details
                )
                tasks.append(task)
        
        # Execute all notifications concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        success_count = sum(1 for r in results if r is True)
        
        logger.info(f"Sent {success_count}/{len(results)} notifications for auction {auction_id}")
        
        return success_count
    
    async def notify_new_car(self, car_details: Dict, users: List[Dict]):
        """Notify users about new cars matching their criteria"""
        
        tasks = []
        
        for user in users:
            if user.get('telegram_chat_id'):
                task = self.telegram_service.send_car_alert(
                    user['telegram_chat_id'], car_details
                )
                tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        success_count = sum(1 for r in results if r is True)
        
        logger.info(f"Sent {success_count}/{len(results)} car alerts for {car_details['brand']} {car_details['model']}")
        
        return success_count
    
    async def notify_new_review(self, dealer_email: str, reviewer_name: str, rating: int, comment: str):
        """Notify dealer about new review"""
        
        return await self.email_service.send_review_notification(
            dealer_email, reviewer_name, rating, comment
        )

# Global notification service instance
notification_service = NotificationService()