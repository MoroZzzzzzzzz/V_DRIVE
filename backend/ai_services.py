import os
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any
from emergentintegrations.llm.chat import LlmChat, UserMessage
from dotenv import load_dotenv
import json
import logging

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AIRecommendationService:
    """AI-powered car recommendation system for VELES DRIVE"""
    
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            logger.warning("EMERGENT_LLM_KEY not found - AI recommendations disabled")
    
    async def get_personalized_recommendations(self, user_preferences: Dict, available_cars: List[Dict]) -> List[Dict]:
        """Get AI-powered car recommendations based on user preferences and behavior"""
        
        if not self.api_key or not available_cars:
            return available_cars[:5]  # Fallback to first 5 cars
        
        try:
            # Create chat session for recommendations
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"recommendations_{uuid.uuid4()}",
                system_message="""Вы - эксперт по автомобилям и AI-консультант для платформы VELES DRIVE. 
                Ваша задача - рекомендовать автомобили пользователям на основе их предпочтений и поведения.
                
                Учитывайте:
                - Бюджет пользователя
                - Предпочтения по типу автомобиля
                - История просмотров
                - Семейное положение и потребности
                - Стиль вождения
                - Практические требования
                
                Отвечайте строго в JSON формате с массивом car_ids и объяснениями."""
            ).with_model("openai", "gpt-4o-mini")
            
            # Prepare recommendation request
            cars_summary = []
            for car in available_cars[:20]:  # Limit to 20 cars for API efficiency
                cars_summary.append({
                    "id": car["id"],
                    "brand": car["brand"],
                    "model": car["model"],
                    "price": car["price"],
                    "year": car["year"],
                    "fuel_type": car.get("fuel_type"),
                    "transmission": car.get("transmission"),
                    "is_premium": car.get("is_premium", False),
                    "vehicle_type": car.get("vehicle_type", "car")
                })
            
            user_message = UserMessage(
                text=f"""Рекомендуйте 5 лучших автомобилей для пользователя на основе данных:

ПРЕДПОЧТЕНИЯ ПОЛЬЗОВАТЕЛЯ:
{json.dumps(user_preferences, ensure_ascii=False, indent=2)}

ДОСТУПНЫЕ АВТОМОБИЛИ:
{json.dumps(cars_summary, ensure_ascii=False, indent=2)}

Верните JSON в формате:
{{
  "recommendations": [
    {{
      "car_id": "id_автомобиля",
      "match_score": 0.95,
      "reasons": ["причина 1", "причина 2", "причина 3"]
    }}
  ]
}}"""
            )
            
            response = await chat.send_message(user_message)
            
            # Parse AI response
            try:
                ai_result = json.loads(response)
                recommendations = ai_result.get("recommendations", [])
                
                # Return cars sorted by AI recommendations
                recommended_cars = []
                car_dict = {car["id"]: car for car in available_cars}
                
                for rec in recommendations:
                    car_id = rec["car_id"]
                    if car_id in car_dict:
                        car = car_dict[car_id].copy()
                        car["ai_match_score"] = rec.get("match_score", 0.8)
                        car["ai_reasons"] = rec.get("reasons", [])
                        recommended_cars.append(car)
                
                return recommended_cars[:5]
                
            except json.JSONDecodeError:
                logger.error(f"Failed to parse AI recommendation response: {response}")
                return available_cars[:5]
            
        except Exception as e:
            logger.error(f"AI recommendation error: {e}")
            return available_cars[:5]
    
    async def generate_car_description(self, car_data: Dict) -> str:
        """Generate AI-powered car description"""
        
        if not self.api_key:
            return car_data.get("description", f"Отличный {car_data['brand']} {car_data['model']} {car_data['year']} года.")
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"description_{uuid.uuid4()}",
                system_message="""Вы - профессиональный автомобильный копирайтер для премиум платформы VELES DRIVE.
                Создавайте привлекательные, но честные описания автомобилей.
                
                Стиль:
                - Премиум и элегантный
                - Подчеркивайте уникальные особенности
                - Используйте эмоциональные триггеры
                - Максимум 200 слов
                - На русском языке"""
            ).with_model("openai", "gpt-4o-mini")
            
            user_message = UserMessage(
                text=f"""Создайте привлекательное описание для автомобиля:

Марка: {car_data['brand']}
Модель: {car_data['model']}
Год: {car_data['year']}
Цена: {car_data['price']:,} ₽
Пробег: {car_data.get('mileage', 'Не указан')} км
Тип топлива: {car_data.get('fuel_type', 'Не указан')}
Трансмиссия: {car_data.get('transmission', 'Не указана')}
Цвет: {car_data.get('color', 'Не указан')}
Премиум: {"Да" if car_data.get('is_premium') else "Нет"}

Текущее описание: {car_data.get('description', 'Отсутствует')}

Создайте новое описание, которое подчеркнет преимущества и привлечет покупателей."""
            )
            
            response = await chat.send_message(user_message)
            return response.strip()
            
        except Exception as e:
            logger.error(f"AI description generation error: {e}")
            return car_data.get("description", f"Отличный {car_data['brand']} {car_data['model']} {car_data['year']} года.")

class AIVirtualAssistant:
    """AI-powered virtual assistant for customer support"""
    
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            logger.warning("EMERGENT_LLM_KEY not found - AI assistant disabled")
    
    async def handle_customer_query(self, query: str, context: Dict = None, session_id: str = None) -> Dict:
        """Handle customer queries with AI assistant"""
        
        if not self.api_key:
            return {
                "response": "Извините, AI-помощник временно недоступен. Обратитесь к менеджеру.",
                "type": "fallback",
                "suggested_actions": []
            }
        
        try:
            if not session_id:
                session_id = f"support_{uuid.uuid4()}"
            
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message="""Вы - виртуальный помощник VELES DRIVE, премиум платформы автомобильного бизнеса.

ВАШИ ВОЗМОЖНОСТИ:
- Помощь в поиске автомобилей
- Консультации по покупке/продаже
- Информация о услугах (страхование, кредиты, лизинг)
- Техническая поддержка платформы
- Помощь дилерам с ERP системой

СТИЛЬ ОБЩЕНИЯ:
- Дружелюбный и профессиональный
- Конкретные и полезные ответы
- Предлагайте следующие шаги
- Всегда на русском языке

ВАЖНО:
- Если не знаете ответ - честно скажите
- Предлагайте связаться с менеджером для сложных вопросов
- Рекомендуйте конкретные функции платформы

Отвечайте в JSON формате:
{
  "response": "ответ пользователю",
  "type": "information|recommendation|action",
  "suggested_actions": ["действие1", "действие2"],
  "needs_human": false
}"""
            ).with_model("openai", "gpt-4o-mini")
            
            # Add context if provided
            context_info = ""
            if context:
                context_info = f"\n\nКОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:\n{json.dumps(context, ensure_ascii=False, indent=2)}"
            
            user_message = UserMessage(
                text=f"ВОПРОС ПОЛЬЗОВАТЕЛЯ: {query}{context_info}"
            )
            
            response = await chat.send_message(user_message)
            
            # Parse AI response
            try:
                ai_result = json.loads(response)
                return {
                    "response": ai_result.get("response", "Извините, произошла ошибка. Попробуйте переформулировать вопрос."),
                    "type": ai_result.get("type", "information"),
                    "suggested_actions": ai_result.get("suggested_actions", []),
                    "needs_human": ai_result.get("needs_human", False),
                    "session_id": session_id
                }
            except json.JSONDecodeError:
                return {
                    "response": response,
                    "type": "information",
                    "suggested_actions": [],
                    "needs_human": False,
                    "session_id": session_id
                }
            
        except Exception as e:
            logger.error(f"AI assistant error: {e}")
            return {
                "response": "Извините, произошла техническая ошибка. Попробуйте позже или обратитесь к менеджеру.",
                "type": "error",
                "suggested_actions": ["Связаться с поддержкой"],
                "needs_human": True,
                "session_id": session_id
            }

class AIAnalyticsService:
    """AI-powered analytics and insights for VELES DRIVE"""
    
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            logger.warning("EMERGENT_LLM_KEY not found - AI analytics disabled")
    
    async def generate_market_insights(self, sales_data: List[Dict], cars_data: List[Dict]) -> Dict:
        """Generate AI-powered market insights and trends"""
        
        if not self.api_key:
            return {"insights": "AI аналитика временно недоступна"}
        
        try:
            chat = LlmChat(
                api_key=self.api_key,
                session_id=f"analytics_{uuid.uuid4()}",
                system_message="""Вы - ведущий автомобильный аналитик для платформы VELES DRIVE.
                Анализируйте данные продаж и предоставляйте ценные инсайты для бизнеса.
                
                Фокус на:
                - Тренды продаж
                - Популярные модели и бренды  
                - Ценовая динамика
                - Сезонные паттерны
                - Рекомендации для дилеров
                
                Отвечайте в JSON формате с конкретными данными и рекомендациями."""
            ).with_model("openai", "gpt-4o-mini")
            
            # Prepare analytics data
            analytics_summary = {
                "total_sales": len(sales_data),
                "total_inventory": len(cars_data),
                "sales_sample": sales_data[:10],  # Recent sales
                "popular_cars": cars_data[:10]    # Popular cars
            }
            
            user_message = UserMessage(
                text=f"""Проанализируйте данные автомобильного рынка и предоставьте инсайты:

ДАННЫЕ ДЛЯ АНАЛИЗА:
{json.dumps(analytics_summary, ensure_ascii=False, indent=2)}

Предоставьте анализ в JSON формате:
{{
  "key_trends": ["тренд 1", "тренд 2"],
  "popular_segments": [{{
    "segment": "название сегмента",
    "growth": "процент роста",
    "reason": "объяснение"
  }}],
  "price_insights": {{
    "average_price": число,
    "trend": "растет/падает/стабильно",
    "recommendation": "рекомендация"
  }},
  "dealer_recommendations": ["рекомендация 1", "рекомендация 2"],
  "seasonal_predictions": "прогноз на следующий период"
}}"""
            )
            
            response = await chat.send_message(user_message)
            
            try:
                return json.loads(response)
            except json.JSONDecodeError:
                return {"insights": response}
                
        except Exception as e:
            logger.error(f"AI analytics error: {e}")
            return {"insights": "Ошибка при генерации аналитики"}

# Global service instances
ai_recommendation_service = AIRecommendationService()
ai_virtual_assistant = AIVirtualAssistant()
ai_analytics_service = AIAnalyticsService()

# Chat history model for persistent conversations
class ChatMessage(dict):
    """Chat message model for storing conversation history"""
    
    def __init__(self, session_id: str, user_id: str, message: str, response: str, timestamp: datetime = None):
        super().__init__()
        self.update({
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "user_id": user_id,
            "message": message,
            "response": response,
            "timestamp": timestamp or datetime.now(timezone.utc),
            "created_at": datetime.now(timezone.utc)
        })

# Smart search with natural language processing
async def process_natural_language_search(query: str, available_cars: List[Dict]) -> List[Dict]:
    """Process natural language search queries with AI"""
    
    api_key = os.getenv('EMERGENT_LLM_KEY')
    if not api_key or not available_cars:
        return available_cars
    
    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"search_{uuid.uuid4()}",
            system_message="""Вы - AI система поиска автомобилей для VELES DRIVE.
            Преобразуйте естественные запросы пользователей в структурированные фильтры поиска.
            
            Понимайте запросы типа:
            - "Нужен семейный автомобиль до 2 миллионов"
            - "Спортивная машина красного цвета"
            - "Экономичный автомобиль для города"
            - "Премиум внедорожник"
            
            Возвращайте JSON с параметрами поиска и отфильтрованными результатами."""
        ).with_model("openai", "gpt-4o-mini")
        
        cars_sample = available_cars[:50]  # Limit for efficiency
        
        user_message = UserMessage(
            text=f"""Найдите автомобили по запросу: "{query}"

ДОСТУПНЫЕ АВТОМОБИЛИ (образец):
{json.dumps(cars_sample, ensure_ascii=False, indent=2)}

Верните JSON:
{{
  "search_intent": "определенная категория поиска",
  "filters": {{
    "price_range": [мин, макс],
    "brands": ["бренд1", "бренд2"],
    "categories": ["категория1"],
    "year_range": [мин_год, макс_год]
  }},
  "matching_car_ids": ["id1", "id2", "id3"],
  "explanation": "объяснение логики поиска"
}}"""
        )
        
        response = await chat.send_message(user_message)
        
        try:
            search_result = json.loads(response)
            matching_ids = search_result.get("matching_car_ids", [])
            
            # Return matching cars
            car_dict = {car["id"]: car for car in available_cars}
            matching_cars = [car_dict[car_id] for car_id in matching_ids if car_id in car_dict]
            
            return matching_cars[:20]  # Return top 20 matches
            
        except json.JSONDecodeError:
            logger.error(f"Failed to parse AI search response: {response}")
            return available_cars[:10]
        
    except Exception as e:
        logger.error(f"AI search error: {e}")
        return available_cars[:10]