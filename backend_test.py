#!/usr/bin/env python3
"""
VELES DRIVE Backend API Testing Suite
Comprehensive testing for all backend endpoints
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
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Test configuration
BASE_URL = "https://carmarketplace-4.preview.emergentagent.com/api"
TEST_TIMEOUT = 30

class VelesDriveAPITester:
    """Main API testing class for VELES DRIVE platform"""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.session = None
        self.test_users = {}
        self.test_data = {}
        self.auth_tokens = {}
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=TEST_TIMEOUT),
            headers={'Content-Type': 'application/json'}
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
        
        try:
            if method.upper() == 'GET':
                async with self.session.get(url, headers=request_headers, params=data) as response:
                    result = await response.json()
                    return {"status": response.status, "data": result}
                    
            elif method.upper() == 'POST':
                if files:
                    # For file uploads, don't set Content-Type header
                    if 'Content-Type' in request_headers:
                        del request_headers['Content-Type']
                    async with self.session.post(url, data=files, headers=request_headers) as response:
                        result = await response.json()
                        return {"status": response.status, "data": result}
                else:
                    async with self.session.post(url, json=data, headers=request_headers) as response:
                        result = await response.json()
                        return {"status": response.status, "data": result}
                        
            elif method.upper() == 'PUT':
                async with self.session.put(url, json=data, headers=request_headers) as response:
                    result = await response.json()
                    return {"status": response.status, "data": result}
                    
            elif method.upper() == 'DELETE':
                async with self.session.delete(url, headers=request_headers) as response:
                    if response.status == 204:
                        return {"status": response.status, "data": {"message": "Deleted successfully"}}
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
    
    def get_auth_headers(self, user_type: str = "dealer") -> Dict:
        """Get authorization headers for requests"""
        token = self.auth_tokens.get(user_type)
        if token:
            return {"Authorization": f"Bearer {token}"}
        return {}
    
    async def test_basic_connectivity(self) -> bool:
        """Test basic API connectivity"""
        logger.info("🔍 Testing basic API connectivity...")
        
        try:
            result = await self.make_request("GET", "/")
            if result["status"] == 200:
                logger.info("✅ API is accessible")
                logger.info(f"API Response: {result['data']}")
                return True
            else:
                logger.error(f"❌ API connectivity failed: {result}")
                return False
        except Exception as e:
            logger.error(f"❌ API connectivity test failed: {str(e)}")
            return False
    
    async def test_authentication_system(self) -> bool:
        """Test user registration and login"""
        logger.info("🔐 Testing Authentication System...")
        
        success = True
        
        # Test user registration for different roles
        test_users = [
            {
                "email": f"dealer_{uuid.uuid4().hex[:8]}@velesdrive.com",
                "password": "Pass123!",
                "full_name": "Тест Дилер",
                "phone": "+7-900-123-4567",
                "role": "dealer",
                "company_name": "Тест Автосалон"
            },
            {
                "email": f"customer_{uuid.uuid4().hex[:8]}@velesdrive.com", 
                "password": "Pass123!",
                "full_name": "Тест Покупатель",
                "phone": "+7-900-765-4321",
                "role": "buyer"
            }
        ]
        
        for user_data in test_users:
            # Test registration
            logger.info(f"Testing registration for {user_data['role']}: {user_data['email']}")
            result = await self.make_request("POST", "/auth/register", user_data)
            
            if result["status"] == 200:
                logger.info(f"✅ Registration successful for {user_data['role']}")
                self.test_users[user_data['role']] = user_data
                self.auth_tokens[user_data['role']] = result["data"]["access_token"]
                logger.info(f"Token received: {result['data']['access_token'][:20]}...")
            else:
                logger.error(f"❌ Registration failed for {user_data['role']}: {result}")
                success = False
                continue
            
            # Test login
            login_data = {
                "email": user_data["email"],
                "password": user_data["password"]
            }
            
            result = await self.make_request("POST", "/auth/login", login_data)
            
            if result["status"] == 200:
                logger.info(f"✅ Login successful for {user_data['role']}")
                # Update token from login
                self.auth_tokens[user_data['role']] = result["data"]["access_token"]
            else:
                logger.error(f"❌ Login failed for {user_data['role']}: {result}")
                success = False
        
        return success
    
    async def test_dealer_system(self) -> bool:
        """Test dealer profile creation and management"""
        logger.info("🏢 Testing Dealer System...")
        
        if "dealer" not in self.auth_tokens:
            logger.error("❌ No dealer token available for testing")
            return False
        
        success = True
        
        # Create dealer profile
        dealer_data = {
            "company_name": "VELES AUTO PREMIUM",
            "description": "Премиальный автосалон с лучшими автомобилями",
            "address": "Москва, ул. Тверская, д. 1",
            "phone": "+7-495-123-4567",
            "email": self.test_users["dealer"]["email"],
            "website": "https://velesauto.ru",
            "working_hours": {
                "monday": "09:00-20:00",
                "tuesday": "09:00-20:00",
                "wednesday": "09:00-20:00",
                "thursday": "09:00-20:00",
                "friday": "09:00-20:00",
                "saturday": "10:00-18:00",
                "sunday": "10:00-18:00"
            }
        }
        
        headers = self.get_auth_headers("dealer")
        result = await self.make_request("POST", "/dealers", dealer_data, headers)
        
        if result["status"] == 200:
            logger.info("✅ Dealer profile created successfully")
            self.test_data["dealer_id"] = result["data"]["id"]
            logger.info(f"Dealer ID: {result['data']['id']}")
        else:
            logger.error(f"❌ Dealer profile creation failed: {result}")
            success = False
        
        # Test getting dealers list
        result = await self.make_request("GET", "/dealers")
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} dealers")
        else:
            logger.error(f"❌ Failed to get dealers list: {result}")
            success = False
        
        return success
    
    async def test_cars_system(self) -> bool:
        """Test car CRUD operations"""
        logger.info("🚗 Testing Cars System...")
        
        if "dealer" not in self.auth_tokens:
            logger.error("❌ No dealer token available for testing")
            return False
        
        success = True
        
        # Create test cars
        test_cars = [
            {
                "brand": "BMW",
                "model": "X5",
                "year": 2023,
                "price": 5500000.0,
                "mileage": 15000,
                "engine_type": "3.0L Turbo",
                "transmission": "Автомат",
                "fuel_type": "Бензин",
                "color": "Черный металлик",
                "vin": "WBAFR9C50DD123456",
                "description": "Премиальный кроссовер BMW X5 в отличном состоянии",
                "features": ["Панорамная крыша", "Кожаный салон", "Навигация", "Камера заднего вида"],
                "is_premium": True,
                "location": "Москва"
            },
            {
                "brand": "Mercedes-Benz",
                "model": "E-Class",
                "year": 2022,
                "price": 4200000.0,
                "mileage": 25000,
                "engine_type": "2.0L Turbo",
                "transmission": "Автомат",
                "fuel_type": "Бензин",
                "color": "Серебристый",
                "vin": "WDD2130421A123456",
                "description": "Элегантный седан Mercedes-Benz E-Class",
                "features": ["AMG пакет", "Подогрев сидений", "Круиз-контроль"],
                "is_premium": True,
                "location": "Санкт-Петербург"
            }
        ]
        
        headers = self.get_auth_headers("dealer")
        created_cars = []
        
        for car_data in test_cars:
            result = await self.make_request("POST", "/cars", car_data, headers)
            
            if result["status"] == 200:
                logger.info(f"✅ Car created: {car_data['brand']} {car_data['model']}")
                created_cars.append(result["data"])
            else:
                logger.error(f"❌ Car creation failed: {result}")
                success = False
        
        self.test_data["cars"] = created_cars
        
        # Test getting cars list
        result = await self.make_request("GET", "/cars")
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} cars")
        else:
            logger.error(f"❌ Failed to get cars list: {result}")
            success = False
        
        # Test car filtering
        filter_params = {
            "brand": "BMW",
            "min_price": 5000000,
            "max_price": 6000000
        }
        
        result = await self.make_request("GET", "/cars", filter_params)
        
        if result["status"] == 200:
            logger.info(f"✅ Car filtering works: {len(result['data'])} BMW cars found")
        else:
            logger.error(f"❌ Car filtering failed: {result}")
            success = False
        
        # Test getting specific car
        if created_cars:
            car_id = created_cars[0]["id"]
            result = await self.make_request("GET", f"/cars/{car_id}")
            
            if result["status"] == 200:
                logger.info(f"✅ Retrieved specific car: {result['data']['brand']} {result['data']['model']}")
            else:
                logger.error(f"❌ Failed to get specific car: {result}")
                success = False
        
        return success
    
    async def test_reviews_system(self) -> bool:
        """Test reviews system"""
        logger.info("⭐ Testing Reviews System...")
        
        if "buyer" not in self.auth_tokens or "dealer_id" not in self.test_data:
            logger.error("❌ Missing buyer token or dealer ID for reviews testing")
            return False
        
        success = True
        
        # Create a review
        review_data = {
            "dealer_id": self.test_data["dealer_id"],
            "rating": 5,
            "comment": "Отличный сервис! Профессиональные консультанты, быстрое оформление документов. Рекомендую!"
        }
        
        headers = self.get_auth_headers("buyer")
        result = await self.make_request("POST", "/reviews", review_data, headers)
        
        if result["status"] == 200:
            logger.info("✅ Review created successfully")
            self.test_data["review_id"] = result["data"]["id"]
        else:
            logger.error(f"❌ Review creation failed: {result}")
            success = False
        
        # Get dealer reviews
        result = await self.make_request("GET", f"/reviews/dealer/{self.test_data['dealer_id']}")
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} reviews for dealer")
        else:
            logger.error(f"❌ Failed to get dealer reviews: {result}")
            success = False
        
        # Get user's own reviews
        result = await self.make_request("GET", "/reviews/my", headers=headers)
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} user reviews")
        else:
            logger.error(f"❌ Failed to get user reviews: {result}")
            success = False
        
        return success
    
    async def test_auctions_system(self) -> bool:
        """Test auctions system"""
        logger.info("🔨 Testing Auctions System...")
        
        if "dealer" not in self.auth_tokens or not self.test_data.get("cars"):
            logger.error("❌ Missing dealer token or cars for auction testing")
            return False
        
        success = True
        
        # Create an auction
        car_id = self.test_data["cars"][0]["id"]
        auction_data = {
            "car_id": car_id,
            "start_price": 5000000.0,
            "min_bid_increment": 50000.0,
            "duration_hours": 48
        }
        
        headers = self.get_auth_headers("dealer")
        result = await self.make_request("POST", "/auctions", auction_data, headers)
        
        if result["status"] == 200:
            logger.info("✅ Auction created successfully")
            self.test_data["auction_id"] = result["data"]["id"]
            logger.info(f"Auction ID: {result['data']['id']}")
        else:
            logger.error(f"❌ Auction creation failed: {result}")
            success = False
            return success
        
        # Get auctions list
        result = await self.make_request("GET", "/auctions")
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} auctions")
        else:
            logger.error(f"❌ Failed to get auctions list: {result}")
            success = False
        
        # Place a bid (as buyer)
        if "buyer" in self.auth_tokens:
            bid_data = {
                "amount": 5100000.0
            }
            
            buyer_headers = self.get_auth_headers("buyer")
            result = await self.make_request("POST", f"/auctions/{self.test_data['auction_id']}/bid", 
                                           bid_data, buyer_headers)
            
            if result["status"] == 200:
                logger.info("✅ Bid placed successfully")
                self.test_data["bid_id"] = result["data"]["id"]
            else:
                logger.error(f"❌ Bid placement failed: {result}")
                success = False
        
        # Get auction bids
        result = await self.make_request("GET", f"/auctions/{self.test_data['auction_id']}/bids")
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} bids for auction")
        else:
            logger.error(f"❌ Failed to get auction bids: {result}")
            success = False
        
        return success
    
    async def test_erp_system(self) -> bool:
        """Test ERP system (projects management)"""
        logger.info("📊 Testing ERP System...")
        
        if "dealer" not in self.auth_tokens:
            logger.error("❌ No dealer token available for ERP testing")
            return False
        
        success = True
        headers = self.get_auth_headers("dealer")
        
        # Test dashboard
        result = await self.make_request("GET", "/erp/dashboard", headers=headers)
        
        if result["status"] == 200:
            logger.info("✅ ERP Dashboard accessible")
            logger.info(f"Dashboard stats: {result['data']['stats']}")
        else:
            logger.error(f"❌ ERP Dashboard failed: {result}")
            success = False
        
        # Create projects
        test_projects = [
            {
                "title": "Подготовка BMW X5 к продаже",
                "description": "Детейлинг, техосмотр, подготовка документов",
                "priority": "high",
                "assigned_to": "Иван Петров",
                "due_date": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
            },
            {
                "title": "Обновление каталога на сайте",
                "description": "Добавить новые поступления, обновить цены",
                "priority": "medium",
                "assigned_to": "Мария Сидорова"
            }
        ]
        
        created_projects = []
        
        for project_data in test_projects:
            result = await self.make_request("POST", "/projects", project_data, headers)
            
            if result["status"] == 200:
                logger.info(f"✅ Project created: {project_data['title']}")
                created_projects.append(result["data"])
            else:
                logger.error(f"❌ Project creation failed: {result}")
                success = False
        
        self.test_data["projects"] = created_projects
        
        # Get projects list
        result = await self.make_request("GET", "/projects", headers=headers)
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} projects")
        else:
            logger.error(f"❌ Failed to get projects list: {result}")
            success = False
        
        # Update project status
        if created_projects:
            project_id = created_projects[0]["id"]
            update_data = {
                "status": "in_progress",
                "description": "Обновленное описание проекта"
            }
            
            result = await self.make_request("PUT", f"/projects/{project_id}", update_data, headers)
            
            if result["status"] == 200:
                logger.info("✅ Project updated successfully")
            else:
                logger.error(f"❌ Project update failed: {result}")
                success = False
        
        return success
    
    async def test_notifications_system(self) -> bool:
        """Test notifications system"""
        logger.info("🔔 Testing Notifications System...")
        
        if "buyer" not in self.auth_tokens:
            logger.error("❌ No buyer token available for notifications testing")
            return False
        
        success = True
        headers = self.get_auth_headers("buyer")
        
        # Get notifications
        result = await self.make_request("GET", "/notifications", headers=headers)
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} notifications")
            
            # Mark first notification as read if any exist
            if result["data"]:
                notification_id = result["data"][0]["id"]
                mark_result = await self.make_request("POST", f"/notifications/{notification_id}/read", 
                                                    headers=headers)
                
                if mark_result["status"] == 200:
                    logger.info("✅ Notification marked as read")
                else:
                    logger.error(f"❌ Failed to mark notification as read: {mark_result}")
                    success = False
        else:
            logger.error(f"❌ Failed to get notifications: {result}")
            success = False
        
        return success
    
    async def test_file_upload_system(self) -> bool:
        """Test file upload system"""
        logger.info("📁 Testing File Upload System...")
        
        if "dealer" not in self.auth_tokens:
            logger.error("❌ No dealer token available for file upload testing")
            return False
        
        success = True
        
        # Note: This is a mock test since we can't actually upload files in this environment
        # In a real test, you would create test image files and upload them
        
        logger.info("ℹ️  File upload testing requires actual image files")
        logger.info("ℹ️  Testing file upload endpoints availability...")
        
        # Test if upload endpoints are accessible (they should return 422 for missing files)
        headers = self.get_auth_headers("dealer")
        
        # Test avatar upload endpoint
        result = await self.make_request("POST", "/upload/avatar", headers=headers)
        
        if result["status"] == 422:  # Unprocessable Entity - missing file
            logger.info("✅ Avatar upload endpoint is accessible")
        else:
            logger.error(f"❌ Avatar upload endpoint issue: {result}")
            success = False
        
        # Test dealer logo upload endpoint  
        result = await self.make_request("POST", "/upload/dealer-logo", headers=headers)
        
        if result["status"] == 422:  # Unprocessable Entity - missing file
            logger.info("✅ Dealer logo upload endpoint is accessible")
        else:
            logger.error(f"❌ Dealer logo upload endpoint issue: {result}")
            success = False
        
        return success
    
    async def test_favorites_system(self) -> bool:
        """Test favorites system"""
        logger.info("❤️ Testing Favorites System...")
        
        if "buyer" not in self.auth_tokens or not self.test_data.get("cars"):
            logger.error("❌ Missing buyer token or cars for favorites testing")
            return False
        
        success = True
        headers = self.get_auth_headers("buyer")
        car_id = self.test_data["cars"][0]["id"]
        
        # Add to favorites
        result = await self.make_request("POST", f"/favorites/{car_id}", headers=headers)
        
        if result["status"] == 200:
            logger.info("✅ Car added to favorites")
        else:
            logger.error(f"❌ Failed to add car to favorites: {result}")
            success = False
        
        # Get favorites
        result = await self.make_request("GET", "/favorites", headers=headers)
        
        if result["status"] == 200:
            logger.info(f"✅ Retrieved {len(result['data'])} favorite cars")
        else:
            logger.error(f"❌ Failed to get favorites: {result}")
            success = False
        
        # Remove from favorites
        result = await self.make_request("DELETE", f"/favorites/{car_id}", headers=headers)
        
        if result["status"] == 200:
            logger.info("✅ Car removed from favorites")
        else:
            logger.error(f"❌ Failed to remove car from favorites: {result}")
            success = False
        
        return success
    
    async def run_all_tests(self) -> Dict[str, bool]:
        """Run all API tests"""
        logger.info("🚀 Starting VELES DRIVE Backend API Testing Suite")
        logger.info(f"Testing API at: {self.base_url}")
        
        test_results = {}
        
        # Test sequence
        tests = [
            ("Basic Connectivity", self.test_basic_connectivity),
            ("Authentication System", self.test_authentication_system),
            ("Dealer System", self.test_dealer_system),
            ("Cars System", self.test_cars_system),
            ("Reviews System", self.test_reviews_system),
            ("Auctions System", self.test_auctions_system),
            ("ERP System", self.test_erp_system),
            ("Notifications System", self.test_notifications_system),
            ("File Upload System", self.test_file_upload_system),
            ("Favorites System", self.test_favorites_system)
        ]
        
        for test_name, test_func in tests:
            logger.info(f"\n{'='*60}")
            logger.info(f"Running: {test_name}")
            logger.info(f"{'='*60}")
            
            try:
                result = await test_func()
                test_results[test_name] = result
                
                if result:
                    logger.info(f"✅ {test_name}: PASSED")
                else:
                    logger.error(f"❌ {test_name}: FAILED")
                    
            except Exception as e:
                logger.error(f"❌ {test_name}: ERROR - {str(e)}")
                test_results[test_name] = False
        
        return test_results
    
    def print_summary(self, results: Dict[str, bool]):
        """Print test results summary"""
        logger.info(f"\n{'='*60}")
        logger.info("TEST RESULTS SUMMARY")
        logger.info(f"{'='*60}")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            logger.info(f"{test_name:<30} {status}")
        
        logger.info(f"\n📊 Overall Results: {passed}/{total} tests passed")
        
        if passed == total:
            logger.info("🎉 All tests passed! VELES DRIVE API is working correctly.")
        else:
            logger.warning(f"⚠️  {total - passed} test(s) failed. Please check the logs above.")
        
        return passed == total

async def main():
    """Main test runner"""
    try:
        async with VelesDriveAPITester() as tester:
            results = await tester.run_all_tests()
            success = tester.print_summary(results)
            
            # Return appropriate exit code
            sys.exit(0 if success else 1)
            
    except KeyboardInterrupt:
        logger.info("\n⏹️  Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"❌ Testing failed with error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())