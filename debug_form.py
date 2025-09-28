#!/usr/bin/env python3
import asyncio
import aiohttp

async def test_form_data():
    """Debug form data handling"""
    
    # Test data
    car_ids = ["c8235ac7-a7b7-4686-8144-db100bfe9852", "46129042-5864-4cbf-acb8-6d8cc3e03259"]
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGFkZGI5NjMtYjViMS00Yzg2LWFiMzktYWNlNjhiMGVhYTZiIiwiZW1haWwiOiJ0ZXN0X2RlYnVnQGV4YW1wbGUuY29tIn0.gnE0IPAMbJVTgbwauST5-_7Fe2tveZx9uSad934XmM0"
    
    async with aiohttp.ClientSession() as session:
        # Create form data
        form_data = aiohttp.FormData()
        for car_id in car_ids:
            form_data.add_field("car_ids", car_id)
        form_data.add_field("name", "Python Test Comparison")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        print("Sending form data:")
        for field in form_data._fields:
            print(f"  {field}")
        
        url = "https://project-continue-16.preview.emergentagent.com/api/comparisons"
        
        async with session.post(url, data=form_data, headers=headers) as response:
            print(f"Status: {response.status}")
            print(f"Headers: {dict(response.headers)}")
            result = await response.text()
            print(f"Response: {result}")

if __name__ == "__main__":
    asyncio.run(test_form_data())