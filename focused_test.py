#!/usr/bin/env python3
"""
Focused test for specific failing systems
"""

import asyncio
import aiohttp
import json
import uuid
from datetime import datetime, timezone, timedelta

BASE_URL = "https://carmarketplace-4.preview.emergentagent.com/api"

async def test_cars_endpoint():
    """Test cars endpoint specifically"""
    print("Testing cars endpoint...")
    
    async with aiohttp.ClientSession() as session:
        # Test GET /cars
        async with session.get(f"{BASE_URL}/cars") as response:
            print(f"GET /cars status: {response.status}")
            if response.status == 200:
                data = await response.json()
                print(f"Found {len(data)} cars")
                return True
            else:
                text = await response.text()
                print(f"Error: {text}")
                return False

async def test_auction_bid():
    """Test auction bidding with proper authentication"""
    print("Testing auction bidding...")
    
    async with aiohttp.ClientSession() as session:
        # Register dealer
        dealer_data = {
            "email": f"dealer_{uuid.uuid4().hex[:8]}@test.com",
            "password": "test123",
            "full_name": "Test Dealer",
            "role": "dealer",
            "company_name": "Test Company"
        }
        
        async with session.post(f"{BASE_URL}/auth/register", json=dealer_data) as response:
            if response.status != 200:
                print(f"Dealer registration failed: {response.status}")
                return False
            dealer_auth = await response.json()
            dealer_token = dealer_auth["access_token"]
        
        # Register buyer
        buyer_data = {
            "email": f"buyer_{uuid.uuid4().hex[:8]}@test.com",
            "password": "test123",
            "full_name": "Test Buyer",
            "role": "buyer"
        }
        
        async with session.post(f"{BASE_URL}/auth/register", json=buyer_data) as response:
            if response.status != 200:
                print(f"Buyer registration failed: {response.status}")
                return False
            buyer_auth = await response.json()
            buyer_token = buyer_auth["access_token"]
        
        # Create car
        car_data = {
            "brand": "Test",
            "model": "Car",
            "year": 2023,
            "price": 1000000.0,
            "color": "Red"
        }
        
        headers = {"Authorization": f"Bearer {dealer_token}"}
        async with session.post(f"{BASE_URL}/cars", json=car_data, headers=headers) as response:
            if response.status != 200:
                print(f"Car creation failed: {response.status}")
                return False
            car = await response.json()
            car_id = car["id"]
        
        # Create auction
        auction_data = {
            "car_id": car_id,
            "start_price": 900000.0,
            "min_bid_increment": 10000.0,
            "duration_hours": 24
        }
        
        async with session.post(f"{BASE_URL}/auctions", json=auction_data, headers=headers) as response:
            if response.status != 200:
                print(f"Auction creation failed: {response.status}")
                return False
            auction = await response.json()
            auction_id = auction["id"]
        
        # Place bid
        bid_data = {
            "amount": 950000.0
        }
        
        buyer_headers = {"Authorization": f"Bearer {buyer_token}"}
        async with session.post(f"{BASE_URL}/auctions/{auction_id}/bid", json=bid_data, headers=buyer_headers) as response:
            print(f"Bid placement status: {response.status}")
            if response.status == 200:
                bid = await response.json()
                print(f"Bid placed successfully: {bid['amount']}")
                return True
            else:
                text = await response.text()
                print(f"Bid placement error: {text}")
                return False

async def main():
    print("Running focused tests...")
    
    cars_result = await test_cars_endpoint()
    print(f"Cars endpoint test: {'PASSED' if cars_result else 'FAILED'}")
    
    auction_result = await test_auction_bid()
    print(f"Auction bidding test: {'PASSED' if auction_result else 'FAILED'}")

if __name__ == "__main__":
    asyncio.run(main())