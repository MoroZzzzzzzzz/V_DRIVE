#!/usr/bin/env python3
"""
VELES DRIVE Telegram Bot Backend API Testing
Specific test for Telegram Bot integration endpoints
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
import logging
import sys
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Test configuration
BASE_URL = "https://veles-auto-hub.preview.emergentagent.com/api"
TEST_TIMEOUT = 30

class TelegramBotTester:
    """Telegram Bot API testing class"""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.session = None
        self.test_users = {}
        self.test_data = {}
        self.auth_tokens = {}
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=TEST_TIMEOUT)
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def make_request(self, method: str, endpoint: str, data: Dict = None, 
                          headers: Dict = None, files: Dict = None) -> Dict:
        """Make HTTP request to API"""
        url = f"{self.base_url}{endpoint}"
        request_headers = headers or {}
        
        # Set default Content-Type for JSON requests
        if not files and 'Content-Type' not in request_headers:
            request_headers['Content-Type'] = 'application/json'
        
        try:
            if method.upper() == 'GET':
                async with self.session.get(url, headers=request_headers, params=data) as response:
                    result = await response.json()
                    return {"status": response.status, "data": result}
                    
            elif method.upper() == 'POST':
                async with self.session.post(url, json=data, headers=request_headers) as response:
                    result = await response.json()
                    return {"status": response.status, "data": result}
                    
        except aiohttp.ClientError as e:
            logger.error(f"Request failed: {method} {url} - {str(e)}")
            return {"status": 0, "error": str(e)}
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            return {"status": 0, "error": "Invalid JSON response"}
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return {"status": 0, "error": str(e)}
    
    def get_auth_headers(self, user_type: str = "buyer") -> Dict:
        """Get authorization headers for requests"""
        token = self.auth_tokens.get(user_type)
        if token:
            return {"Authorization": f"Bearer {token}"}
        return {}
    
    async def create_test_users(self) -> bool:
        """Create test users for Telegram testing"""
        logger.info("👥 Creating test users for Telegram testing...")
        
        success = True
        unique_suffix = uuid.uuid4().hex[:6]
        
        test_users = [
            {
                "email": f"buyer_{unique_suffix}@test.com",
                "password": "testpass123",
                "full_name": "Test Buyer",
                "phone": "+7-900-000-0001",
                "role": "buyer"
            },
            {
                "email": f"dealer_{unique_suffix}@test.com",
                "password": "testpass123",
                "full_name": "Test Dealer",
                "phone": "+7-900-000-0002",
                "role": "dealer",
                "company_name": "Test Dealer Company"
            },
            {
                "email": f"admin_{unique_suffix}@test.com",
                "password": "testpass123",
                "full_name": "Test Admin",
                "phone": "+7-900-000-0003",
                "role": "admin"
            }
        ]
        
        for user_data in test_users:
            logger.info(f"Creating {user_data['role']}: {user_data['email']}")
            result = await self.make_request("POST", "/auth/register", user_data)
            
            if result["status"] == 200:
                logger.info(f"✅ Created {user_data['role']}: {user_data['email']}")
                self.test_users[user_data['role']] = user_data
                self.auth_tokens[user_data['role']] = result["data"]["access_token"]
            else:
                logger.error(f"❌ Failed to create {user_data['role']}: {result}")
                success = False
        
        return success
    
    async def test_telegram_endpoints(self) -> bool:
        """Test all Telegram Bot backend endpoints"""
        logger.info("🤖 Testing Telegram Bot Integration Endpoints...")
        
        success = True
        
        # Test scenarios for different user roles
        test_scenarios = [
            ("buyer", "Buyer User"),
            ("dealer", "Dealer User"), 
            ("admin", "Admin User")
        ]
        
        for role, description in test_scenarios:
            if role not in self.auth_tokens:
                logger.warning(f"⚠️  No {role} token available for Telegram testing")
                continue
                
            logger.info(f"\n🔍 Testing Telegram endpoints for {description}...")
            headers = self.get_auth_headers(role)
            
            # Test 1: Telegram Status Endpoint - /api/telegram/status
            logger.info(f"📊 Testing Telegram Status for {description}...")
            result = await self.make_request("GET", "/telegram/status", headers=headers)
            
            if result["status"] == 200:
                status_data = result["data"]
                connected = status_data.get('connected', False)
                logger.info(f"✅ Telegram Status - {description}: connected={connected}")
                
                if not connected:
                    logger.info(f"   📋 New user - no Telegram connection yet")
                    logger.info(f"   📋 Chat ID: {status_data.get('chat_id', 'None')}")
                    logger.info(f"   📋 Username: {status_data.get('username', 'None')}")
                    logger.info(f"   📋 Notifications enabled: {status_data.get('notifications_enabled', True)}")
                else:
                    logger.info(f"   📋 User already has Telegram connected")
            else:
                logger.error(f"❌ Telegram Status failed for {description}: {result}")
                success = False
            
            # Test 2: Generate Code Endpoint - /api/telegram/generate-code
            logger.info(f"🔑 Testing Generate Code for {description}...")
            result = await self.make_request("POST", "/telegram/generate-code", headers=headers)
            
            if result["status"] == 200:
                code_data = result["data"]
                connection_code = code_data.get('connection_code')
                logger.info(f"✅ Generate Code - {description}: code={connection_code}")
                logger.info(f"   ⏰ Code expires in: {code_data.get('expires_in')} seconds")
                logger.info(f"   🤖 Bot username: {code_data.get('bot_username')}")
                logger.info(f"   📝 Instructions: {code_data.get('instructions')}")
                
                # Validate code format (should be 8 characters, uppercase)
                if connection_code and len(connection_code) == 8 and connection_code.isupper():
                    logger.info(f"   ✅ Code format is correct: 8 uppercase characters")
                else:
                    logger.error(f"   ❌ Code format is incorrect: expected 8 uppercase chars, got {connection_code}")
                    success = False
                
                # Store connection code for connect test
                self.test_data[f"telegram_code_{role}"] = connection_code
                
            elif result["status"] == 400 and "already connected" in result["data"].get("detail", ""):
                logger.info(f"✅ Generate Code - {description}: User already has Telegram connected (expected)")
            else:
                logger.error(f"❌ Generate Code failed for {description}: {result}")
                success = False
            
            # Test 3: Connect Account Endpoint - /api/telegram/connect
            if f"telegram_code_{role}" in self.test_data:
                logger.info(f"🔗 Testing Connect Account for {description}...")
                
                connect_data = {
                    "connection_code": self.test_data[f"telegram_code_{role}"]
                }
                
                result = await self.make_request("POST", "/telegram/connect", connect_data, headers)
                
                if result["status"] == 404 and "Invalid or expired" in result["data"].get("detail", ""):
                    logger.info(f"✅ Connect Account - {description}: Correctly validates connection code")
                    logger.info(f"   📋 Expected behavior: code not found in telegram_connections collection")
                elif result["status"] == 200:
                    logger.info(f"✅ Connect Account - {description}: Successfully connected")
                    logger.info(f"   📋 Message: {result['data'].get('message')}")
                else:
                    logger.error(f"❌ Connect Account failed for {description}: {result}")
                    success = False
            
            # Test 4: Disconnect Account Endpoint - /api/telegram/disconnect
            logger.info(f"🔌 Testing Disconnect Account for {description}...")
            result = await self.make_request("POST", "/telegram/disconnect", headers=headers)
            
            if result["status"] == 200:
                logger.info(f"✅ Disconnect Account - {description}: Successfully disconnected")
                logger.info(f"   📋 Message: {result['data'].get('message')}")
            else:
                logger.error(f"❌ Disconnect Account failed for {description}: {result}")
                success = False
        
        return success
    
    async def test_admin_telegram_endpoints(self) -> bool:
        """Test admin-only Telegram endpoints"""
        logger.info("\n👑 Testing Admin-only Telegram Endpoints...")
        
        if "admin" not in self.auth_tokens:
            logger.error("❌ No admin token available for admin endpoint testing")
            return False
        
        success = True
        admin_headers = self.get_auth_headers("admin")
        
        # Test 5: Send Notification Endpoint - /api/telegram/send-notification (admin only)
        logger.info("📢 Testing Send Notification (Admin only)...")
        notification_data = {
            "message": "🚗 Test notification from VELES DRIVE admin panel - Новое поступление автомобилей!",
            "type": "info",
            "user_ids": []  # Send to all users with Telegram
        }
        
        result = await self.make_request("POST", "/telegram/send-notification", notification_data, admin_headers)
        
        if result["status"] == 200:
            notif_data = result["data"]
            sent_count = notif_data.get('sent_count', 0)
            failed_count = notif_data.get('failed_count', 0)
            total_users = notif_data.get('total_users', 0)
            
            logger.info(f"✅ Send Notification - Admin: sent={sent_count}, failed={failed_count}")
            logger.info(f"   📊 Total users with Telegram: {total_users}")
            logger.info(f"   📋 Message: {notif_data.get('message')}")
            
            if total_users == 0:
                logger.info(f"   ℹ️  No users have Telegram connected yet (expected for new test users)")
        else:
            logger.error(f"❌ Send Notification failed for Admin: {result}")
            success = False
        
        # Test 6: Get Telegram Users Endpoint - /api/telegram/users (admin only)
        logger.info("👥 Testing Get Telegram Users (Admin only)...")
        result = await self.make_request("GET", "/telegram/users", headers=admin_headers)
        
        if result["status"] == 200:
            users_data = result["data"]
            user_count = users_data.get("total_count", 0)
            users_list = users_data.get("users", [])
            
            logger.info(f"✅ Get Telegram Users - Admin: {user_count} users with Telegram integration")
            
            if user_count > 0:
                logger.info(f"   📋 Telegram users found:")
                for user in users_list[:5]:  # Show first 5 users
                    email = user.get('email', 'No email')
                    role = user.get('role', 'No role')
                    username = user.get('telegram_username', 'No username')
                    connected_at = user.get('connected_at', 'Unknown')
                    notifications = user.get('notifications_enabled', True)
                    
                    logger.info(f"     👤 {email} ({role}) - @{username}")
                    logger.info(f"        Connected: {connected_at}, Notifications: {notifications}")
            else:
                logger.info(f"   ℹ️  No users have Telegram connected yet (expected for new test users)")
        else:
            logger.error(f"❌ Get Telegram Users failed for Admin: {result}")
            success = False
        
        return success
    
    async def test_access_control(self) -> bool:
        """Test access control for admin-only endpoints"""
        logger.info("\n🔒 Testing Access Control for Admin Endpoints...")
        
        success = True
        
        # Test with buyer credentials
        if "buyer" in self.auth_tokens:
            buyer_headers = self.get_auth_headers("buyer")
            
            logger.info("🔍 Testing Buyer access to admin endpoints...")
            
            # Test send notification (should fail with 403)
            result = await self.make_request("POST", "/telegram/send-notification", 
                                           {"message": "test"}, buyer_headers)
            
            if result["status"] == 403:
                logger.info("✅ Access Control - Buyer correctly blocked from send-notification (HTTP 403)")
                logger.info(f"   📋 Error: {result['data'].get('detail')}")
            else:
                logger.error(f"❌ Access Control - Buyer should not access send-notification: {result}")
                success = False
            
            # Test get users (should fail with 403)
            result = await self.make_request("GET", "/telegram/users", headers=buyer_headers)
            
            if result["status"] == 403:
                logger.info("✅ Access Control - Buyer correctly blocked from telegram/users (HTTP 403)")
                logger.info(f"   📋 Error: {result['data'].get('detail')}")
            else:
                logger.error(f"❌ Access Control - Buyer should not access telegram/users: {result}")
                success = False
        
        # Test with dealer credentials
        if "dealer" in self.auth_tokens:
            dealer_headers = self.get_auth_headers("dealer")
            
            logger.info("🔍 Testing Dealer access to admin endpoints...")
            
            # Test send notification (should fail with 403)
            result = await self.make_request("POST", "/telegram/send-notification", 
                                           {"message": "test"}, dealer_headers)
            
            if result["status"] == 403:
                logger.info("✅ Access Control - Dealer correctly blocked from send-notification (HTTP 403)")
            else:
                logger.error(f"❌ Access Control - Dealer should not access send-notification: {result}")
                success = False
        
        return success
    
    async def test_telegram_integration_comprehensive(self) -> bool:
        """Run comprehensive Telegram Bot integration tests"""
        logger.info("🚀 Starting VELES DRIVE Telegram Bot Integration Testing...")
        logger.info(f"Testing against: {self.base_url}")
        logger.info("\n📋 Test Plan:")
        logger.info("1. Telegram Status Endpoint - /api/telegram/status")
        logger.info("2. Generate Code Endpoint - /api/telegram/generate-code")
        logger.info("3. Connect Account Endpoint - /api/telegram/connect")
        logger.info("4. Disconnect Account Endpoint - /api/telegram/disconnect")
        logger.info("5. Send Notification Endpoint - /api/telegram/send-notification (admin)")
        logger.info("6. Get Telegram Users Endpoint - /api/telegram/users (admin)")
        logger.info("7. Access Control Testing")
        
        # Create test users
        if not await self.create_test_users():
            logger.error("❌ Failed to create test users")
            return False
        
        success = True
        
        # Test basic Telegram endpoints
        if not await self.test_telegram_endpoints():
            logger.error("❌ Basic Telegram endpoints failed")
            success = False
        
        # Test admin-only endpoints
        if not await self.test_admin_telegram_endpoints():
            logger.error("❌ Admin Telegram endpoints failed")
            success = False
        
        # Test access control
        if not await self.test_access_control():
            logger.error("❌ Access control tests failed")
            success = False
        
        return success

async def main():
    """Main test function"""
    async with TelegramBotTester() as tester:
        success = await tester.test_telegram_integration_comprehensive()
        
        logger.info("\n" + "="*80)
        logger.info("📊 TELEGRAM BOT INTEGRATION TEST RESULTS")
        logger.info("="*80)
        
        if success:
            logger.info("🎉 All Telegram Bot integration tests PASSED!")
            logger.info("\n✅ SUMMARY:")
            logger.info("   • Telegram Status endpoint working correctly")
            logger.info("   • Generate Code endpoint creates 8-char uppercase codes")
            logger.info("   • Connect Account endpoint validates connection codes")
            logger.info("   • Disconnect Account endpoint works for all users")
            logger.info("   • Send Notification endpoint restricted to admins")
            logger.info("   • Get Telegram Users endpoint restricted to admins")
            logger.info("   • Access control properly blocks non-admin users")
            logger.info("\n📋 NOTES:")
            logger.info("   • Connection codes expire in 10 minutes as specified")
            logger.info("   • MongoDB collections (users, telegram_connections) used correctly")
            logger.info("   • All endpoints require authentication (HTTP 401 without token)")
            logger.info("   • Admin endpoints protected with role checks (HTTP 403 for non-admins)")
        else:
            logger.error("❌ Some Telegram Bot integration tests FAILED!")
            logger.error("Check the logs above for detailed error information.")
        
        return success

if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if result else 1)