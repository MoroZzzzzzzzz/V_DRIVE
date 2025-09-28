#!/usr/bin/env python3
"""
VELES DRIVE Telegram Bot Startup Script
Run this script to start the Telegram bot service
"""

import os
import sys
import asyncio
import logging
from telegram_bot import VelesDriveTelegramBot

# Setup logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

async def main():
    """Main function to start the Telegram bot"""
    logger.info("Starting VELES DRIVE Telegram Bot Service...")
    
    # Check if bot token is provided
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token:
        logger.error("TELEGRAM_BOT_TOKEN not found in environment variables")
        logger.info("Please set TELEGRAM_BOT_TOKEN in your .env file")
        logger.info("To get a bot token:")
        logger.info("1. Open Telegram and search for @BotFather")
        logger.info("2. Send /newbot command")
        logger.info("3. Follow the instructions to create your bot")
        logger.info("4. Copy the token and add it to your .env file")
        return
    
    # Initialize and start the bot
    bot = VelesDriveTelegramBot()
    
    try:
        await bot.start_bot()
    except KeyboardInterrupt:
        logger.info("Received shutdown signal...")
        await bot.stop_bot()
        logger.info("Bot stopped successfully")
    except Exception as e:
        logger.error(f"Bot error: {e}")
        await bot.stop_bot()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot shutdown requested by user")
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")
        sys.exit(1)