#!/usr/bin/env python3
"""
VELES DRIVE Additional Services Testing Suite
Comprehensive testing for Insurance, Loan, and Lease endpoints
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
BASE_URL = "https://velesdrive.preview.emergentagent.com/api"
TEST_TIMEOUT = 30

class AdditionalServicesAPITester:
    """Additional Services API testing class for VELES DRIVE platform"""
    
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
                if files:
                    # For file uploads and form data, let aiohttp set the Content-Type header
                    headers_copy = request_headers.copy()
                    if 'Content-Type' in headers_copy:
                        del headers_copy['Content-Type']
                    async with self.session.post(url, data=files, headers=headers_copy) as response:
                        result = await response.json()
                        return {"status": response.status, "data": result}
                else:
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
    
    async def setup_test_users(self) -> bool:
        """Setup test users as specified in the review request"""
        logger.info("🔧 Setting up test users...")
        
        # Create unique test users for this test session to avoid 2FA issues
        unique_id = uuid.uuid4().hex[:8]
        test_users_data = [
            {
                "email": f"test_buyer_services_{unique_id}@test.com",
                "password": "testpass123",
                "full_name": "Тест Покупатель Услуги",
                "phone": "+7-900-123-4567",
                "role": "buyer"
            },
            {
                "email": f"test_dealer_services_{unique_id}@test.com",
                "password": "testpass123",
                "full_name": "Тест Дилер Услуги",
                "phone": "+7-900-765-4321",
                "role": "dealer",
                "company_name": "Тест Автосалон Услуги"
            },
            {
                "email": f"test_admin_services_{unique_id}@test.com",
                "password": "testpass123",
                "full_name": "Тест Администратор Услуги",
                "phone": "+7-900-555-0000",
                "role": "admin"
            }
        ]
        
        success = True
        
        for user_data in test_users_data:
            # Try to login first (user might already exist)
            login_data = {
                "email": user_data["email"],
                "password": user_data["password"]
            }
            
            result = await self.make_request("POST", "/auth/login", login_data)
            
            if result["status"] == 200:
                logger.info(f"✅ Logged in existing user: {user_data['role']} ({user_data['email']})")
                self.test_users[user_data['role']] = user_data
                self.auth_tokens[user_data['role']] = result["data"]["access_token"]
            else:
                # User doesn't exist, try to register
                logger.info(f"User {user_data['email']} doesn't exist, attempting registration...")
                result = await self.make_request("POST", "/auth/register", user_data)
                
                if result["status"] == 200:
                    logger.info(f"✅ Registered new user: {user_data['role']} ({user_data['email']})")
                    self.test_users[user_data['role']] = user_data
                    self.auth_tokens[user_data['role']] = result["data"]["access_token"]
                else:
                    logger.error(f"❌ Failed to register user {user_data['role']}: {result}")
                    success = False
        
        return success
    
    async def setup_test_cars(self) -> bool:
        """Setup test cars for services testing"""
        logger.info("🚗 Setting up test cars...")
        
        if "dealer" not in self.auth_tokens:
            logger.error("❌ No dealer token available for car setup")
            return False
        
        # Create test cars for different price ranges and types
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
                "description": "Премиальный кроссовер BMW X5",
                "features": ["Панорамная крыша", "Кожаный салон", "Навигация"],
                "is_premium": True,
                "location": "Москва"
            },
            {
                "brand": "Toyota",
                "model": "Camry",
                "year": 2022,
                "price": 2800000.0,
                "mileage": 25000,
                "engine_type": "2.5L",
                "transmission": "Автомат",
                "fuel_type": "Бензин",
                "color": "Белый",
                "vin": "4T1BF1FK5DU123456",
                "description": "Надежный седан Toyota Camry",
                "features": ["Климат-контроль", "Подогрев сидений"],
                "is_premium": False,
                "location": "Санкт-Петербург"
            },
            {
                "brand": "Mercedes-Benz",
                "model": "S-Class",
                "year": 2023,
                "price": 8500000.0,
                "mileage": 5000,
                "engine_type": "4.0L V8 Turbo",
                "transmission": "Автомат",
                "fuel_type": "Бензин",
                "color": "Серебристый",
                "vin": "WDD2220461A123456",
                "description": "Флагманский седан Mercedes-Benz S-Class",
                "features": ["Массаж сидений", "Панорамная крыша", "Премиум аудио"],
                "is_premium": True,
                "location": "Москва"
            }
        ]
        
        headers = self.get_auth_headers("dealer")
        created_cars = []
        
        for car_data in test_cars:
            result = await self.make_request("POST", "/cars", car_data, headers)
            
            if result["status"] == 200:
                logger.info(f"✅ Car created: {car_data['brand']} {car_data['model']} - {car_data['price']:,} ₽")
                created_cars.append(result["data"])
            else:
                logger.error(f"❌ Car creation failed: {result}")
                return False
        
        self.test_data["cars"] = created_cars
        return True
    
    async def test_insurance_quotes_comprehensive(self) -> bool:
        """Test insurance quote endpoint with comprehensive scenarios"""
        logger.info("🛡️ Testing Insurance Quote System Comprehensively...")
        
        if "buyer" not in self.auth_tokens or not self.test_data.get("cars"):
            logger.error("❌ Missing buyer token or cars for insurance testing")
            return False
        
        success = True
        headers = self.get_auth_headers("buyer")
        
        # Test scenarios as specified in the review request
        insurance_scenarios = [
            # ОСАГО для разных возрастов водителей
            {
                "name": "ОСАГО - водитель 25 лет",
                "car_price": 2800000.0,  # Toyota Camry
                "insurance_type": "OSAGO",
                "coverage_amount": 500000,
                "driver_age": 25,
                "driving_experience": 5,
                "region": "москва"
            },
            {
                "name": "ОСАГО - водитель 35 лет",
                "car_price": 5500000.0,  # BMW X5
                "insurance_type": "OSAGO", 
                "coverage_amount": 500000,
                "driver_age": 35,
                "driving_experience": 15,
                "region": "спб"
            },
            {
                "name": "ОСАГО - водитель 50 лет",
                "car_price": 8500000.0,  # Mercedes S-Class
                "insurance_type": "OSAGO",
                "coverage_amount": 500000,
                "driver_age": 50,
                "driving_experience": 30,
                "region": "регионы"
            },
            # КАСКО с различным покрытием
            {
                "name": "КАСКО - покрытие 300,000",
                "car_price": 2800000.0,
                "insurance_type": "KASKO",
                "coverage_amount": 300000,
                "driver_age": 30,
                "driving_experience": 10,
                "region": "москва"
            },
            {
                "name": "КАСКО - покрытие 500,000",
                "car_price": 5500000.0,
                "insurance_type": "KASKO",
                "coverage_amount": 500000,
                "driver_age": 35,
                "driving_experience": 15,
                "region": "спб"
            },
            {
                "name": "КАСКО - покрытие 1,000,000",
                "car_price": 8500000.0,
                "insurance_type": "KASKO",
                "coverage_amount": 1000000,
                "driver_age": 40,
                "driving_experience": 20,
                "region": "москва"
            },
            # FULL покрытие для разных регионов
            {
                "name": "FULL - Москва",
                "car_price": 5500000.0,
                "insurance_type": "FULL",
                "coverage_amount": 6600000,
                "driver_age": 35,
                "driving_experience": 15,
                "region": "москва"
            },
            {
                "name": "FULL - СПб",
                "car_price": 8500000.0,
                "insurance_type": "FULL",
                "coverage_amount": 10200000,
                "driver_age": 45,
                "driving_experience": 25,
                "region": "спб"
            },
            {
                "name": "FULL - Регионы",
                "car_price": 2800000.0,
                "insurance_type": "FULL",
                "coverage_amount": 3360000,
                "driver_age": 30,
                "driving_experience": 10,
                "region": "регионы"
            }
        ]
        
        # Find appropriate cars for each scenario
        cars_by_price = {car["price"]: car for car in self.test_data["cars"]}
        
        for scenario in insurance_scenarios:
            logger.info(f"\n--- Testing: {scenario['name']} ---")
            
            # Find car with matching price
            car = cars_by_price.get(scenario["car_price"])
            if not car:
                logger.error(f"❌ No car found with price {scenario['car_price']}")
                success = False
                continue
            
            # Prepare form data
            form_data = aiohttp.FormData()
            form_data.add_field("car_id", car["id"])
            form_data.add_field("insurance_type", scenario["insurance_type"])
            form_data.add_field("coverage_amount", str(scenario["coverage_amount"]))
            
            result = await self.make_request("POST", "/services/insurance/quote", files=form_data, headers=headers)
            
            if result["status"] == 200:
                quote = result["data"]
                logger.info(f"✅ Insurance quote generated successfully")
                logger.info(f"   Type: {quote['insurance_type']}")
                logger.info(f"   Coverage: {quote['coverage_amount']:,} ₽")
                logger.info(f"   Monthly premium: {quote['monthly_premium']:,.2f} ₽")
                logger.info(f"   Yearly premium: {quote['yearly_premium']:,.2f} ₽")
                logger.info(f"   Provider: {quote['provider']}")
                
                # Validate quote calculations
                expected_monthly = quote['yearly_premium'] / 12
                if abs(quote['monthly_premium'] - expected_monthly) > 1:
                    logger.error(f"❌ Monthly premium calculation error: {quote['monthly_premium']} vs {expected_monthly}")
                    success = False
                else:
                    logger.info("✅ Premium calculations are correct")
                
                # Validate insurance type logic
                if scenario["insurance_type"] == "OSAGO":
                    if quote['yearly_premium'] > 15000:
                        logger.error(f"❌ OSAGO premium too high: {quote['yearly_premium']} (max should be 15,000)")
                        success = False
                elif scenario["insurance_type"] == "KASKO":
                    expected_rate = scenario["car_price"] * 0.08
                    if abs(quote['yearly_premium'] - expected_rate) > 1000:
                        logger.warning(f"⚠️  KASKO premium differs from expected: {quote['yearly_premium']} vs {expected_rate}")
                elif scenario["insurance_type"] == "FULL":
                    expected_rate = scenario["car_price"] * 0.12
                    if abs(quote['yearly_premium'] - expected_rate) > 1000:
                        logger.warning(f"⚠️  FULL premium differs from expected: {quote['yearly_premium']} vs {expected_rate}")
                
            else:
                logger.error(f"❌ Insurance quote failed: {result}")
                success = False
        
        # Test input validation
        logger.info("\n--- Testing Input Validation ---")
        
        # Test with invalid car ID
        form_data = aiohttp.FormData()
        form_data.add_field("car_id", str(uuid.uuid4()))
        form_data.add_field("insurance_type", "OSAGO")
        form_data.add_field("coverage_amount", "500000")
        
        result = await self.make_request("POST", "/services/insurance/quote", files=form_data, headers=headers)
        
        if result["status"] == 404:
            logger.info("✅ Properly validates car existence")
        else:
            logger.error(f"❌ Should return 404 for invalid car ID: {result}")
            success = False
        
        # Test without authentication
        result = await self.make_request("POST", "/services/insurance/quote", files=form_data)
        
        if result["status"] == 403:
            logger.info("✅ Properly requires authentication")
        else:
            logger.error(f"❌ Should require authentication: {result}")
            success = False
        
        # Get user's insurance quotes
        result = await self.make_request("GET", "/services/insurance/quotes", headers=headers)
        
        if result["status"] == 200:
            quotes = result["data"]
            logger.info(f"✅ Retrieved {len(quotes)} insurance quotes for user")
        else:
            logger.error(f"❌ Failed to get user insurance quotes: {result}")
            success = False
        
        return success
    
    async def test_loan_applications_comprehensive(self) -> bool:
        """Test loan application endpoint with comprehensive scenarios"""
        logger.info("💰 Testing Loan Application System Comprehensively...")
        
        if "buyer" not in self.auth_tokens or not self.test_data.get("cars"):
            logger.error("❌ Missing buyer token or cars for loan testing")
            return False
        
        success = True
        headers = self.get_auth_headers("buyer")
        
        # Test scenarios as specified in the review request
        loan_scenarios = [
            # Разные соотношения доход/кредит
            {
                "name": "Высокий доход - низкий кредит",
                "car_price": 2800000.0,
                "loan_amount": 2000000.0,
                "monthly_income": 200000.0,
                "employment_status": "employed",
                "loan_term_months": 36,
                "expected_approval": True
            },
            {
                "name": "Средний доход - средний кредит",
                "car_price": 5500000.0,
                "loan_amount": 4000000.0,
                "monthly_income": 150000.0,
                "employment_status": "employed",
                "loan_term_months": 60,
                "expected_approval": True
            },
            {
                "name": "Низкий доход - высокий кредит",
                "car_price": 8500000.0,
                "loan_amount": 7000000.0,
                "monthly_income": 80000.0,
                "employment_status": "employed",
                "loan_term_months": 84,
                "expected_approval": False
            },
            # Различные статусы занятости
            {
                "name": "Самозанятый - средний доход",
                "car_price": 5500000.0,
                "loan_amount": 4000000.0,
                "monthly_income": 120000.0,
                "employment_status": "self-employed",
                "loan_term_months": 60,
                "expected_approval": True
            },
            {
                "name": "Владелец бизнеса - высокий доход",
                "car_price": 8500000.0,
                "loan_amount": 6000000.0,
                "monthly_income": 300000.0,
                "employment_status": "business-owner",
                "loan_term_months": 60,
                "expected_approval": True
            },
            # Разные сроки кредитования
            {
                "name": "Краткосрочный кредит - 12 месяцев",
                "car_price": 2800000.0,
                "loan_amount": 2000000.0,
                "monthly_income": 200000.0,
                "employment_status": "employed",
                "loan_term_months": 12,
                "expected_approval": True
            },
            {
                "name": "Среднесрочный кредит - 36 месяцев",
                "car_price": 5500000.0,
                "loan_amount": 4000000.0,
                "monthly_income": 150000.0,
                "employment_status": "employed",
                "loan_term_months": 36,
                "expected_approval": True
            },
            {
                "name": "Долгосрочный кредит - 84 месяца",
                "car_price": 8500000.0,
                "loan_amount": 6000000.0,
                "monthly_income": 200000.0,
                "employment_status": "employed",
                "loan_term_months": 84,
                "expected_approval": True
            }
        ]
        
        # Find appropriate cars for each scenario
        cars_by_price = {car["price"]: car for car in self.test_data["cars"]}
        
        for scenario in loan_scenarios:
            logger.info(f"\n--- Testing: {scenario['name']} ---")
            
            # Find car with matching price
            car = cars_by_price.get(scenario["car_price"])
            if not car:
                logger.error(f"❌ No car found with price {scenario['car_price']}")
                success = False
                continue
            
            # Prepare loan application data
            loan_data = {
                "car_id": car["id"],
                "loan_amount": scenario["loan_amount"],
                "monthly_income": scenario["monthly_income"],
                "employment_status": scenario["employment_status"],
                "loan_term_months": scenario["loan_term_months"]
            }
            
            result = await self.make_request("POST", "/services/loans/apply", loan_data, headers)
            
            if result["status"] == 200:
                application = result["data"]
                logger.info(f"✅ Loan application submitted successfully")
                logger.info(f"   Loan amount: {application['loan_amount']:,} ₽")
                logger.info(f"   Term: {application['loan_term_months']} months")
                logger.info(f"   Status: {application['status']}")
                logger.info(f"   Employment: {application['employment_status']}")
                
                if application["status"] == "approved":
                    logger.info(f"   Interest rate: {application['interest_rate']}%")
                    logger.info(f"   Monthly payment: {application['monthly_payment']:,.2f} ₽")
                    logger.info(f"   Bank partner: {application['bank_partner']}")
                    
                    # Validate monthly payment calculation
                    loan_amount = application['loan_amount']
                    rate = application['interest_rate'] / 100 / 12
                    term = application['loan_term_months']
                    expected_payment = (loan_amount * rate * (1 + rate)**term) / ((1 + rate)**term - 1)
                    
                    if abs(application['monthly_payment'] - expected_payment) > 100:
                        logger.warning(f"⚠️  Monthly payment calculation differs: {application['monthly_payment']} vs {expected_payment:.2f}")
                    else:
                        logger.info("✅ Monthly payment calculation is correct")
                
                # Check if approval matches expectation
                if scenario["expected_approval"] and application["status"] != "approved":
                    logger.warning(f"⚠️  Expected approval but got: {application['status']}")
                elif not scenario["expected_approval"] and application["status"] == "approved":
                    logger.warning(f"⚠️  Expected rejection but got approval")
                else:
                    logger.info("✅ Approval logic matches expectation")
                
            else:
                logger.error(f"❌ Loan application failed: {result}")
                success = False
        
        # Test input validation
        logger.info("\n--- Testing Input Validation ---")
        
        # Test with invalid car ID
        invalid_loan_data = {
            "car_id": str(uuid.uuid4()),
            "loan_amount": 2000000.0,
            "monthly_income": 100000.0,
            "employment_status": "employed",
            "loan_term_months": 60
        }
        
        result = await self.make_request("POST", "/services/loans/apply", invalid_loan_data, headers)
        
        if result["status"] == 404:
            logger.info("✅ Properly validates car existence")
        else:
            logger.error(f"❌ Should return 404 for invalid car ID: {result}")
            success = False
        
        # Test without authentication
        result = await self.make_request("POST", "/services/loans/apply", invalid_loan_data)
        
        if result["status"] == 403:
            logger.info("✅ Properly requires authentication")
        else:
            logger.error(f"❌ Should require authentication: {result}")
            success = False
        
        # Get user's loan applications
        result = await self.make_request("GET", "/services/loans/applications", headers=headers)
        
        if result["status"] == 200:
            applications = result["data"]
            logger.info(f"✅ Retrieved {len(applications)} loan applications for user")
        else:
            logger.error(f"❌ Failed to get user loan applications: {result}")
            success = False
        
        return success
    
    async def test_lease_applications_comprehensive(self) -> bool:
        """Test lease application endpoint with comprehensive scenarios"""
        logger.info("🚙 Testing Lease Application System Comprehensively...")
        
        if "buyer" not in self.auth_tokens or not self.test_data.get("cars"):
            logger.error("❌ Missing buyer token or cars for lease testing")
            return False
        
        success = True
        headers = self.get_auth_headers("buyer")
        
        # Test scenarios as specified in the review request
        lease_scenarios = [
            # Разные сроки лизинга
            {
                "name": "Краткосрочный лизинг - 12 месяцев",
                "car_price": 2800000.0,
                "lease_term_months": 12,
                "mileage_limit": 15000,
                "maintenance_included": True
            },
            {
                "name": "Среднесрочный лизинг - 24 месяца",
                "car_price": 5500000.0,
                "lease_term_months": 24,
                "mileage_limit": 20000,
                "maintenance_included": True
            },
            {
                "name": "Долгосрочный лизинг - 36 месяцев",
                "car_price": 8500000.0,
                "lease_term_months": 36,
                "mileage_limit": 25000,
                "maintenance_included": False
            },
            {
                "name": "Максимальный срок - 48 месяцев",
                "car_price": 5500000.0,
                "lease_term_months": 48,
                "mileage_limit": 10000,
                "maintenance_included": True
            },
            # Различные лимиты пробега
            {
                "name": "Низкий пробег - 10k км",
                "car_price": 2800000.0,
                "lease_term_months": 36,
                "mileage_limit": 10000,
                "maintenance_included": True
            },
            {
                "name": "Средний пробег - 15k км",
                "car_price": 5500000.0,
                "lease_term_months": 36,
                "mileage_limit": 15000,
                "maintenance_included": True
            },
            {
                "name": "Высокий пробег - 20k км",
                "car_price": 8500000.0,
                "lease_term_months": 36,
                "mileage_limit": 20000,
                "maintenance_included": False
            },
            {
                "name": "Максимальный пробег - 25k км",
                "car_price": 5500000.0,
                "lease_term_months": 36,
                "mileage_limit": 25000,
                "maintenance_included": False
            }
        ]
        
        # Find appropriate cars for each scenario
        cars_by_price = {car["price"]: car for car in self.test_data["cars"]}
        
        for scenario in lease_scenarios:
            logger.info(f"\n--- Testing: {scenario['name']} ---")
            
            # Find car with matching price
            car = cars_by_price.get(scenario["car_price"])
            if not car:
                logger.error(f"❌ No car found with price {scenario['car_price']}")
                success = False
                continue
            
            # Prepare lease application data
            lease_data = {
                "car_id": car["id"],
                "lease_term_months": scenario["lease_term_months"]
            }
            
            result = await self.make_request("POST", "/services/leasing/apply", lease_data, headers)
            
            if result["status"] == 200:
                application = result["data"]
                logger.info(f"✅ Lease application submitted successfully")
                logger.info(f"   Car: {car['brand']} {car['model']} ({car['price']:,} ₽)")
                logger.info(f"   Term: {application['lease_term_months']} months")
                logger.info(f"   Down payment: {application['down_payment']:,.2f} ₽")
                logger.info(f"   Monthly payment: {application['monthly_payment']:,.2f} ₽")
                logger.info(f"   Residual value: {application['residual_value']:,.2f} ₽")
                logger.info(f"   Status: {application['status']}")
                logger.info(f"   Leasing company: {application['leasing_company']}")
                
                # Validate lease calculations
                car_price = scenario["car_price"]
                expected_down = car_price * 0.2  # 20% down payment
                expected_residual = car_price * 0.4  # 40% residual value
                expected_monthly = (car_price - expected_down - expected_residual) / scenario["lease_term_months"]
                
                if abs(application['down_payment'] - expected_down) > 1000:
                    logger.error(f"❌ Down payment calculation error: {application['down_payment']} vs {expected_down}")
                    success = False
                else:
                    logger.info("✅ Down payment calculation is correct")
                
                if abs(application['residual_value'] - expected_residual) > 1000:
                    logger.error(f"❌ Residual value calculation error: {application['residual_value']} vs {expected_residual}")
                    success = False
                else:
                    logger.info("✅ Residual value calculation is correct")
                
                if abs(application['monthly_payment'] - expected_monthly) > 1000:
                    logger.error(f"❌ Monthly payment calculation error: {application['monthly_payment']} vs {expected_monthly}")
                    success = False
                else:
                    logger.info("✅ Monthly payment calculation is correct")
                
            else:
                logger.error(f"❌ Lease application failed: {result}")
                success = False
        
        # Test input validation
        logger.info("\n--- Testing Input Validation ---")
        
        # Test with invalid car ID
        invalid_lease_data = {
            "car_id": str(uuid.uuid4()),
            "lease_term_months": 36
        }
        
        result = await self.make_request("POST", "/services/leasing/apply", invalid_lease_data, headers)
        
        if result["status"] == 404:
            logger.info("✅ Properly validates car existence")
        else:
            logger.error(f"❌ Should return 404 for invalid car ID: {result}")
            success = False
        
        # Test without authentication
        result = await self.make_request("POST", "/services/leasing/apply", invalid_lease_data)
        
        if result["status"] == 403:
            logger.info("✅ Properly requires authentication")
        else:
            logger.error(f"❌ Should require authentication: {result}")
            success = False
        
        # Get user's lease applications
        result = await self.make_request("GET", "/services/leasing/applications", headers=headers)
        
        if result["status"] == 200:
            applications = result["data"]
            logger.info(f"✅ Retrieved {len(applications)} lease applications for user")
        else:
            logger.error(f"❌ Failed to get user lease applications: {result}")
            success = False
        
        return success
    
    async def test_authentication_requirements(self) -> bool:
        """Test that all endpoints require proper authentication"""
        logger.info("🔐 Testing Authentication Requirements...")
        
        success = True
        
        # Test endpoints without authentication
        endpoints_to_test = [
            ("POST", "/services/insurance/quote"),
            ("GET", "/services/insurance/quotes"),
            ("POST", "/services/loans/apply"),
            ("GET", "/services/loans/applications"),
            ("POST", "/services/leasing/apply"),
            ("GET", "/services/leasing/applications")
        ]
        
        for method, endpoint in endpoints_to_test:
            logger.info(f"Testing {method} {endpoint} without auth...")
            
            if method == "POST":
                # Use minimal valid data for POST requests
                if "insurance" in endpoint:
                    form_data = aiohttp.FormData()
                    form_data.add_field("car_id", str(uuid.uuid4()))
                    form_data.add_field("insurance_type", "OSAGO")
                    result = await self.make_request(method, endpoint, files=form_data)
                elif "loans" in endpoint:
                    data = {"car_id": str(uuid.uuid4()), "loan_amount": 1000000, "monthly_income": 100000, "employment_status": "employed", "loan_term_months": 60}
                    result = await self.make_request(method, endpoint, data)
                elif "leasing" in endpoint:
                    data = {"car_id": str(uuid.uuid4()), "lease_term_months": 36}
                    result = await self.make_request(method, endpoint, data)
            else:
                result = await self.make_request(method, endpoint)
            
            if result["status"] == 403:
                logger.info(f"✅ {method} {endpoint} properly requires authentication")
            else:
                logger.error(f"❌ {method} {endpoint} should require authentication, got status: {result['status']}")
                success = False
        
        return success
    
    async def run_comprehensive_test(self) -> bool:
        """Run comprehensive test of all additional services"""
        logger.info("🚀 Starting Comprehensive Additional Services Testing...")
        logger.info("="*80)
        
        overall_success = True
        test_results = {}
        
        # Test phases
        test_phases = [
            ("User Setup", self.setup_test_users),
            ("Car Setup", self.setup_test_cars),
            ("Insurance Quotes", self.test_insurance_quotes_comprehensive),
            ("Loan Applications", self.test_loan_applications_comprehensive),
            ("Lease Applications", self.test_lease_applications_comprehensive),
            ("Authentication Requirements", self.test_authentication_requirements)
        ]
        
        for phase_name, test_func in test_phases:
            logger.info(f"\n{'='*20} {phase_name} {'='*20}")
            try:
                result = await test_func()
                test_results[phase_name] = result
                if result:
                    logger.info(f"✅ {phase_name}: PASSED")
                else:
                    logger.error(f"❌ {phase_name}: FAILED")
                    overall_success = False
            except Exception as e:
                logger.error(f"❌ {phase_name}: ERROR - {str(e)}")
                test_results[phase_name] = False
                overall_success = False
        
        # Final summary
        logger.info(f"\n{'='*80}")
        logger.info("ADDITIONAL SERVICES TEST RESULTS SUMMARY")
        logger.info(f"{'='*80}")
        
        passed = sum(1 for result in test_results.values() if result)
        total = len(test_results)
        
        for phase_name, result in test_results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            logger.info(f"{phase_name:<30} {status}")
        
        logger.info(f"\nOverall Result: {passed}/{total} tests passed")
        
        if overall_success:
            logger.info("🎉 ALL ADDITIONAL SERVICES TESTS PASSED!")
        else:
            logger.error("💥 SOME ADDITIONAL SERVICES TESTS FAILED!")
        
        return overall_success

async def main():
    """Main test execution function"""
    async with AdditionalServicesAPITester() as tester:
        success = await tester.run_comprehensive_test()
        return success

if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Test execution failed: {str(e)}")
        sys.exit(1)