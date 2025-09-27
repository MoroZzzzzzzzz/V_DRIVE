from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends, File, UploadFile, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from payments import router as payments_router
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
from enum import Enum
import jwt
from passlib.context import CryptContext
from integrations import notification_service
from file_upload import file_upload_service
from ai_services import ai_recommendation_service, ai_virtual_assistant, ai_analytics_service, process_natural_language_search, ChatMessage
from security import two_factor_auth, security_service, data_encryption, audit_log

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('SECRET_KEY', 'veles-drive-secret-key-2024')

# Create the main app
app = FastAPI(title="VELES DRIVE API", description="Premium Automotive Business Platform")
api_router = APIRouter(prefix="/api")

# Enums
class UserRole(str, Enum):
    BUYER = "buyer"
    DEALER = "dealer" 
    ADMIN = "admin"

class CarStatus(str, Enum):
    AVAILABLE = "available"
    SOLD = "sold"
    RESERVED = "reserved"

class TransactionType(str, Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    SERVICE = "service"

class VehicleType(str, Enum):
    CAR = "car"
    MOTORCYCLE = "motorcycle"
    BOAT = "boat"
    PLANE = "plane"

class LeadStatus(str, Enum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    PROPOSAL = "proposal"
    WON = "won"
    LOST = "lost"

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    company_name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    # 2FA fields
    two_fa_enabled: bool = False
    two_fa_secret: Optional[str] = None
    backup_codes: List[str] = []
    last_backup_codes_generated: Optional[datetime] = None
    # Security fields
    last_login: Optional[datetime] = None
    login_attempts: int = 0
    account_locked_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole
    company_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Car(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    vehicle_type: VehicleType = VehicleType.CAR
    brand: str
    model: str
    year: int
    price: float
    currency: str = "RUB"
    mileage: Optional[int] = None
    engine_type: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    color: str
    vin: Optional[str] = None
    description: Optional[str] = None
    images: List[str] = []
    features: List[str] = []
    status: CarStatus = CarStatus.AVAILABLE
    is_premium: bool = False
    location: Optional[str] = None
    # Vehicle type specific fields
    engine_power: Optional[int] = None  # HP for cars, motorcycles
    boat_length: Optional[float] = None  # For boats
    plane_seats: Optional[int] = None  # For planes
    hours_operated: Optional[int] = None  # For boats/planes instead of mileage
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarCreate(BaseModel):
    vehicle_type: VehicleType = VehicleType.CAR
    brand: str
    model: str
    year: int
    price: float
    mileage: Optional[int] = None
    engine_type: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    color: str
    vin: Optional[str] = None
    description: Optional[str] = None
    images: List[str] = []
    features: List[str] = []
    is_premium: bool = False
    location: Optional[str] = None
    engine_power: Optional[int] = None
    boat_length: Optional[float] = None
    plane_seats: Optional[int] = None
    hours_operated: Optional[int] = None

class Dealer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    company_name: str
    description: Optional[str] = None
    address: str
    phone: str
    email: EmailStr
    website: Optional[str] = None
    logo_url: Optional[str] = None
    images: List[str] = []
    working_hours: Dict[str, str] = {}
    rating: float = 0.0
    reviews_count: int = 0
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DealerCreate(BaseModel):
    company_name: str
    description: Optional[str] = None
    address: str
    phone: str
    email: EmailStr
    website: Optional[str] = None
    working_hours: Dict[str, str] = {}

class Favorite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    car_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    dealer_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    customer_id: Optional[str] = None
    car_id: Optional[str] = None
    type: TransactionType
    amount: float
    currency: str = "RUB"
    description: str
    date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(BaseModel):
    dealer_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class Notification(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    message: str
    type: str = "info"  # info, warning, success, error
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"

class AuctionStatus(str, Enum):
    ACTIVE = "active"
    ENDED = "ended"
    CANCELLED = "cancelled"

class Auction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    car_id: str
    dealer_id: str
    start_price: float
    current_price: float
    min_bid_increment: float = 1000.0
    start_time: datetime
    end_time: datetime
    status: AuctionStatus = AuctionStatus.ACTIVE
    winner_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AuctionCreate(BaseModel):
    car_id: str
    start_price: float
    min_bid_increment: float = 1000.0
    duration_hours: int = 24

class Bid(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    auction_id: str
    user_id: str
    amount: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BidCreate(BaseModel):
    amount: float

class ProjectStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    title: str
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.TODO
    assigned_to: Optional[str] = None
    priority: str = "medium"  # low, medium, high
    due_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    assigned_to: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

# Additional models for missing functionality
class ViewHistory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    car_id: str
    viewed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarComparison(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    car_ids: List[str]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    name: Optional[str] = None

class Customer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    user_id: Optional[str] = None  # If registered user
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_contact: Optional[datetime] = None
    tags: List[str] = []
    status: str = "active"  # active, inactive, potential

class CustomerCreate(BaseModel):
    name: str
    email: str
    phone: str
    address: Optional[str] = None
    notes: Optional[str] = None
    tags: List[str] = []

class Sale(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    customer_id: str
    car_id: str
    sale_price: float
    sale_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "completed"  # pending, completed, cancelled
    commission: Optional[float] = None
    payment_method: Optional[str] = None
    notes: Optional[str] = None

class ServiceRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    customer_id: str
    car_id: Optional[str] = None
    service_type: str
    description: str
    cost: float
    service_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    next_service_date: Optional[datetime] = None
    status: str = "completed"  # scheduled, in_progress, completed

class PersonalOffer(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    customer_id: str
    car_id: str
    offer_price: float
    regular_price: float
    discount_percent: float
    message: str
    valid_until: datetime
    status: str = "active"  # active, accepted, declined, expired
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Lead(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    name: str
    email: str
    phone: str
    interested_car_id: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    status: LeadStatus = LeadStatus.NEW
    source: str = "website"  # website, phone, referral, etc.
    notes: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_contact: Optional[datetime] = None
    assigned_to: Optional[str] = None

class InsuranceQuote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    car_id: str
    insurance_type: str = "OSAGO"  # OSAGO, KASKO, FULL
    coverage_amount: float
    monthly_premium: float
    yearly_premium: float
    provider: str
    valid_until: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class LoanApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    car_id: str
    loan_amount: float
    monthly_income: float
    employment_status: str
    loan_term_months: int
    interest_rate: Optional[float] = None
    monthly_payment: Optional[float] = None
    status: str = "pending"  # pending, approved, rejected
    bank_partner: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None

class LeaseApplication(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    car_id: str
    lease_term_months: int
    monthly_payment: float
    down_payment: float
    residual_value: float
    status: str = "pending"  # pending, approved, rejected
    leasing_company: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    approved_at: Optional[datetime] = None

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    return jwt.encode(data, SECRET_KEY, algorithm="HS256")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user_data = await db.users.find_one({"id": user_id})
        if not user_data:
            raise HTTPException(status_code=401, detail="User not found")
        
        return User(**user_data)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@api_router.get("/")
async def root():
    return {"message": "VELES DRIVE API", "version": "1.0.0"}

# Auth routes
@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = hash_password(user_data.password)
    user = User(**user_data.dict(exclude={"password"}))
    
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    
    await db.users.insert_one(user_dict)
    
    token = create_access_token({"user_id": user.id, "email": user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.dict()
    }

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login(login_data: UserLogin):
    user_data = await db.users.find_one({"email": login_data.email})
    if not user_data or not verify_password(login_data.password, user_data["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not user_data["is_active"]:
        raise HTTPException(status_code=401, detail="Account is disabled")
    
    user = User(**user_data)
    token = create_access_token({"user_id": user.id, "email": user.email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user.dict()
    }

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    user_dict = current_user.dict()
    # Remove password hash from response
    if "password_hash" in user_dict:
        del user_dict["password_hash"]
    return user_dict

# Cars routes
@api_router.get("/cars", response_model=List[Car])
async def get_cars(
    brand: Optional[str] = None,
    model: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    is_premium: Optional[bool] = None,
    limit: int = Query(20, le=100)
):
    filter_query = {"status": "available"}
    
    if brand:
        filter_query["brand"] = {"$regex": brand, "$options": "i"}
    if model:
        filter_query["model"] = {"$regex": model, "$options": "i"}
    if min_price is not None:
        filter_query.setdefault("price", {})["$gte"] = min_price
    if max_price is not None:
        filter_query.setdefault("price", {})["$lte"] = max_price
    if min_year is not None:
        filter_query.setdefault("year", {})["$gte"] = min_year
    if max_year is not None:
        filter_query.setdefault("year", {})["$lte"] = max_year
    if is_premium is not None:
        filter_query["is_premium"] = is_premium
    
    cars = await db.cars.find(filter_query).limit(limit).to_list(length=None)
    return [Car(**car) for car in cars]

@api_router.get("/cars/{car_id}", response_model=Car)
async def get_car(car_id: str):
    car_data = await db.cars.find_one({"id": car_id})
    if not car_data:
        raise HTTPException(status_code=404, detail="Car not found")
    return Car(**car_data)

@api_router.post("/cars", response_model=Car)
async def create_car(car_data: CarCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.DEALER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only dealers can add cars")
    
    car = Car(**car_data.dict(), dealer_id=current_user.id)
    await db.cars.insert_one(car.dict())
    return car

# Dealers routes
@api_router.get("/dealers", response_model=List[Dealer])
async def get_dealers(limit: int = Query(20, le=100)):
    dealers = await db.dealers.find().limit(limit).to_list(length=None)
    return [Dealer(**dealer) for dealer in dealers]

@api_router.get("/dealers/{dealer_id}", response_model=Dealer)
async def get_dealer(dealer_id: str):
    dealer_data = await db.dealers.find_one({"id": dealer_id})
    if not dealer_data:
        raise HTTPException(status_code=404, detail="Dealer not found")
    return Dealer(**dealer_data)

@api_router.post("/dealers", response_model=Dealer)
async def create_dealer(dealer_data: DealerCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealer accounts can create dealer profiles")
    
    dealer = Dealer(**dealer_data.dict(), user_id=current_user.id)
    await db.dealers.insert_one(dealer.dict())
    return dealer

# Favorites routes
@api_router.post("/favorites/{car_id}")
async def add_to_favorites(car_id: str, current_user: User = Depends(get_current_user)):
    existing = await db.favorites.find_one({"user_id": current_user.id, "car_id": car_id})
    if existing:
        raise HTTPException(status_code=400, detail="Car already in favorites")
    
    favorite = Favorite(user_id=current_user.id, car_id=car_id)
    await db.favorites.insert_one(favorite.dict())
    return {"message": "Added to favorites"}

@api_router.delete("/favorites/{car_id}")
async def remove_from_favorites(car_id: str, current_user: User = Depends(get_current_user)):
    result = await db.favorites.delete_one({"user_id": current_user.id, "car_id": car_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Favorite not found")
    return {"message": "Removed from favorites"}

@api_router.get("/favorites", response_model=List[Car])
async def get_favorites(current_user: User = Depends(get_current_user)):
    favorites = await db.favorites.find({"user_id": current_user.id}).to_list(length=None)
    car_ids = [fav["car_id"] for fav in favorites]
    
    cars = await db.cars.find({"id": {"$in": car_ids}}).to_list(length=None)
    return [Car(**car) for car in cars]

# ERP routes for dealers
@api_router.get("/erp/dashboard")
async def get_dashboard_stats(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can access ERP")
    
    total_cars = await db.cars.count_documents({"dealer_id": current_user.id})
    available_cars = await db.cars.count_documents({"dealer_id": current_user.id, "status": "available"})
    sold_cars = await db.cars.count_documents({"dealer_id": current_user.id, "status": "sold"})
    
    # Recent transactions
    transactions = await db.transactions.find({"dealer_id": current_user.id}).sort("date", -1).limit(10).to_list(length=None)
    
    return {
        "stats": {
            "total_cars": total_cars,
            "available_cars": available_cars,
            "sold_cars": sold_cars
        },
        "recent_transactions": [Transaction(**t) for t in transactions]
    }

@api_router.post("/erp/transactions", response_model=Transaction)
async def create_transaction(transaction_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can create transactions")
    
    transaction = Transaction(**transaction_data, dealer_id=current_user.id)
    await db.transactions.insert_one(transaction.dict())
    return transaction

# Reviews routes
@api_router.get("/reviews/dealer/{dealer_id}", response_model=List[Review])
async def get_dealer_reviews(dealer_id: str, limit: int = Query(20, le=100)):
    reviews = await db.reviews.find({"dealer_id": dealer_id}).sort("created_at", -1).limit(limit).to_list(length=None)
    return [Review(**review) for review in reviews]

@api_router.post("/reviews", response_model=Review)
async def create_review(review_data: ReviewCreate, current_user: User = Depends(get_current_user)):
    # Check if user already reviewed this dealer
    existing = await db.reviews.find_one({"user_id": current_user.id, "dealer_id": review_data.dealer_id})
    if existing:
        raise HTTPException(status_code=400, detail="You have already reviewed this dealer")
    
    review = Review(**review_data.dict(), user_id=current_user.id)
    await db.reviews.insert_one(review.dict())
    
    # Update dealer rating
    reviews = await db.reviews.find({"dealer_id": review_data.dealer_id}).to_list(length=None)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.dealers.update_one(
        {"id": review_data.dealer_id},
        {"$set": {"rating": avg_rating, "reviews_count": len(reviews)}}
    )
    
    # Send notification to dealer
    try:
        dealer_data = await db.dealers.find_one({"id": review_data.dealer_id})
        if dealer_data:
            await notification_service.notify_new_review(
                dealer_data["email"],
                current_user.full_name,
                review_data.rating,
                review_data.comment or ""
            )
    except Exception as e:
        logger.error(f"Failed to send review notification: {e}")
    
    return review

@api_router.get("/reviews/my", response_model=List[Review])
async def get_my_reviews(current_user: User = Depends(get_current_user)):
    reviews = await db.reviews.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    return [Review(**review) for review in reviews]

# Notifications routes
@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(current_user: User = Depends(get_current_user)):
    notifications = await db.notifications.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    return [Notification(**notif) for notif in notifications]

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_user)):
    result = await db.notifications.update_one(
        {"id": notification_id, "user_id": current_user.id},
        {"$set": {"is_read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.post("/notifications/admin", response_model=Notification)
async def create_notification(notification_data: NotificationCreate, target_user_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can create notifications")
    
    notification = Notification(**notification_data.dict(), user_id=target_user_id)
    await db.notifications.insert_one(notification.dict())
    return notification

# Auctions routes
@api_router.get("/auctions", response_model=List[Auction])
async def get_auctions(status: Optional[AuctionStatus] = None, limit: int = Query(20, le=100)):
    filter_query = {}
    if status:
        filter_query["status"] = status
    
    auctions = await db.auctions.find(filter_query).sort("created_at", -1).limit(limit).to_list(length=None)
    return [Auction(**auction) for auction in auctions]

@api_router.get("/auctions/{auction_id}", response_model=Auction)
async def get_auction(auction_id: str):
    auction_data = await db.auctions.find_one({"id": auction_id})
    if not auction_data:
        raise HTTPException(status_code=404, detail="Auction not found")
    return Auction(**auction_data)

@api_router.post("/auctions", response_model=Auction)
async def create_auction(auction_data: AuctionCreate, current_user: User = Depends(get_current_user)):
    if current_user.role not in [UserRole.DEALER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only dealers can create auctions")
    
    # Check if car exists and belongs to dealer
    car_data = await db.cars.find_one({"id": auction_data.car_id})
    if not car_data:
        raise HTTPException(status_code=404, detail="Car not found")
    if car_data["dealer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only auction your own cars")
    
    start_time = datetime.now(timezone.utc)
    end_time = start_time + timedelta(hours=auction_data.duration_hours)
    
    auction = Auction(
        **auction_data.dict(exclude={"duration_hours"}),
        dealer_id=current_user.id,
        current_price=auction_data.start_price,
        start_time=start_time,
        end_time=end_time
    )
    await db.auctions.insert_one(auction.dict())
    return auction

@api_router.get("/auctions/{auction_id}/bids", response_model=List[Bid])
async def get_auction_bids(auction_id: str):
    bids = await db.bids.find({"auction_id": auction_id}).sort("amount", -1).to_list(length=None)
    return [Bid(**bid) for bid in bids]

@api_router.post("/auctions/{auction_id}/bid", response_model=Bid)
async def place_bid(auction_id: str, bid_data: BidCreate, current_user: User = Depends(get_current_user)):
    # Check if auction exists and is active
    auction_data = await db.auctions.find_one({"id": auction_id})
    if not auction_data:
        raise HTTPException(status_code=404, detail="Auction not found")
    
    auction = Auction(**auction_data)
    if auction.status != AuctionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Auction is not active")
    
    current_time = datetime.now(timezone.utc)
    auction_end_time = auction.end_time
    if auction_end_time.tzinfo is None:
        auction_end_time = auction_end_time.replace(tzinfo=timezone.utc)
    
    if current_time > auction_end_time:
        raise HTTPException(status_code=400, detail="Auction has ended")
    
    # Check if bid amount is valid
    min_bid = auction.current_price + auction.min_bid_increment
    if bid_data.amount < min_bid:
        raise HTTPException(status_code=400, detail=f"Minimum bid is {min_bid}")
    
    # Create bid
    bid = Bid(**bid_data.dict(), auction_id=auction_id, user_id=current_user.id)
    await db.bids.insert_one(bid.dict())
    
    # Update auction current price
    await db.auctions.update_one(
        {"id": auction_id},
        {"$set": {"current_price": bid_data.amount}}
    )
    
    # Notify other bidders about new bid
    try:
        # Get car details
        car_data = await db.cars.find_one({"id": auction.car_id})
        
        # Get users who have bid on this auction (excluding current bidder)
        previous_bids = await db.bids.find({"auction_id": auction_id, "user_id": {"$ne": current_user.id}}).to_list(length=None)
        unique_bidder_ids = list(set([b["user_id"] for b in previous_bids]))
        
        # Get user details for notifications
        users_to_notify = []
        for user_id in unique_bidder_ids:
            user_data = await db.users.find_one({"id": user_id})
            if user_data:
                users_to_notify.append({
                    "email": user_data["email"],
                    "telegram_chat_id": user_data.get("telegram_chat_id")
                })
        
        if car_data and users_to_notify:
            car_details = {
                "id": car_data["id"],
                "brand": car_data["brand"],
                "model": car_data["model"],
                "year": car_data["year"],
                "current_price": bid_data.amount
            }
            
            await notification_service.notify_new_bid(auction_id, car_details, users_to_notify)
            
    except Exception as e:
        logger.error(f"Failed to send bid notifications: {e}")
    
    return bid

# Projects (Trello-style) routes
@api_router.get("/projects", response_model=List[Project])
async def get_projects(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can access projects")
    
    projects = await db.projects.find({"dealer_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    return [Project(**project) for project in projects]

@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can create projects")
    
    project = Project(**project_data.dict(), dealer_id=current_user.id)
    await db.projects.insert_one(project.dict())
    return project

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_data: ProjectUpdate, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can update projects")
    
    # Check if project exists and belongs to dealer
    existing = await db.projects.find_one({"id": project_id, "dealer_id": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = {k: v for k, v in project_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    
    updated_project = await db.projects.find_one({"id": project_id})
    return Project(**updated_project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can delete projects")
    
    result = await db.projects.delete_one({"id": project_id, "dealer_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"message": "Project deleted"}

# File upload routes
@api_router.post("/upload/car-image")
async def upload_car_image(
    file: UploadFile = File(...),
    car_id: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Upload car image"""
    if current_user.role not in [UserRole.DEALER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only dealers can upload car images")
    
    # Check if car exists and belongs to current dealer
    car_data = await db.cars.find_one({"id": car_id})
    if not car_data:
        raise HTTPException(status_code=404, detail="Car not found")
    
    if car_data["dealer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only upload images for your own cars")
    
    try:
        result = await file_upload_service.upload_file(file, "cars", car_id)
        
        # Update car with new image
        images = car_data.get("images", [])
        images.append(result["file_path"])
        await db.cars.update_one({"id": car_id}, {"$set": {"images": images}})
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload user avatar"""
    try:
        result = await file_upload_service.upload_file(file, "avatars", current_user.id)
        
        # Update user with new avatar
        await db.users.update_one(
            {"id": current_user.id}, 
            {"$set": {"avatar_url": result["file_path"]}}
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/upload/dealer-logo")
async def upload_dealer_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload dealer logo"""
    if current_user.role not in [UserRole.DEALER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only dealers can upload logos")
    
    # Get or create dealer profile
    dealer_data = await db.dealers.find_one({"user_id": current_user.id})
    if not dealer_data:
        raise HTTPException(status_code=404, detail="Dealer profile not found")
    
    try:
        result = await file_upload_service.upload_file(file, "logos", dealer_data["id"])
        
        # Update dealer with new logo
        await db.dealers.update_one(
            {"id": dealer_data["id"]}, 
            {"$set": {"logo_url": result["file_path"]}}
        )
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/files/{category}/{filename}")
async def get_file(category: str, filename: str):
    """Serve uploaded files"""
    if category not in ["cars", "avatars", "logos"]:
        raise HTTPException(status_code=404, detail="Invalid category")
    
    file_path = Path(f"uploads/{category}/{filename}")
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(file_path)

@api_router.delete("/files/{category}/{filename}")
async def delete_file(
    category: str, 
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Delete uploaded file"""
    # Only allow file owners or admins to delete files
    if current_user.role != UserRole.ADMIN:
        # Additional permission checks would go here
        pass
    
    file_path = f"{category}/{filename}"
    success = file_upload_service.delete_file(file_path)
    
    if success:
        return {"message": "File deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="File not found or could not be deleted")

# Car comparison and history routes
@api_router.post("/cars/{car_id}/view")
async def record_car_view(car_id: str, current_user: User = Depends(get_current_user)):
    """Record that user viewed a car"""
    
    # Check if car exists
    car_data = await db.cars.find_one({"id": car_id})
    if not car_data:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Record view
    view_history = ViewHistory(user_id=current_user.id, car_id=car_id)
    await db.view_history.insert_one(view_history.dict())
    
    return {"message": "View recorded"}

@api_router.get("/cars/history", response_model=List[Car])
async def get_view_history(current_user: User = Depends(get_current_user), limit: int = Query(20, le=100)):
    """Get user's car viewing history"""
    
    # Get recent views
    views = await db.view_history.find({"user_id": current_user.id}).sort("viewed_at", -1).limit(limit).to_list(length=None)
    car_ids = [view["car_id"] for view in views]
    
    # Get cars
    cars = await db.cars.find({"id": {"$in": car_ids}}).to_list(length=None)
    
    # Sort cars by view order
    cars_dict = {car["id"]: car for car in cars}
    sorted_cars = [cars_dict[car_id] for car_id in car_ids if car_id in cars_dict]
    
    return [Car(**car) for car in sorted_cars]

@api_router.post("/comparisons", response_model=CarComparison)
async def create_comparison(
    car_ids: List[str] = Form(...),
    name: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """Create a car comparison"""
    
    if len(car_ids) < 2 or len(car_ids) > 5:
        raise HTTPException(status_code=400, detail="Can compare 2-5 cars")
    
    # Verify all cars exist
    cars = await db.cars.find({"id": {"$in": car_ids}}).to_list(length=None)
    if len(cars) != len(car_ids):
        raise HTTPException(status_code=404, detail="One or more cars not found")
    
    comparison = CarComparison(user_id=current_user.id, car_ids=car_ids, name=name)
    await db.comparisons.insert_one(comparison.dict())
    
    return comparison

@api_router.get("/comparisons", response_model=List[CarComparison])
async def get_comparisons(current_user: User = Depends(get_current_user)):
    """Get user's car comparisons"""
    
    comparisons = await db.comparisons.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    return [CarComparison(**comp) for comp in comparisons]

@api_router.get("/comparisons/{comparison_id}/cars", response_model=List[Car])
async def get_comparison_cars(comparison_id: str, current_user: User = Depends(get_current_user)):
    """Get cars in a comparison"""
    
    comparison = await db.comparisons.find_one({"id": comparison_id, "user_id": current_user.id})
    if not comparison:
        raise HTTPException(status_code=404, detail="Comparison not found")
    
    cars = await db.cars.find({"id": {"$in": comparison["car_ids"]}}).to_list(length=None)
    return [Car(**car) for car in cars]

@api_router.delete("/comparisons/{comparison_id}")
async def delete_comparison(comparison_id: str, current_user: User = Depends(get_current_user)):
    """Delete a comparison"""
    
    result = await db.comparisons.delete_one({"id": comparison_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comparison not found")
    
    return {"message": "Comparison deleted"}

# CRM routes for dealers
@api_router.get("/crm/customers", response_model=List[Customer])
async def get_customers(current_user: User = Depends(get_current_user), limit: int = Query(50, le=200)):
    """Get dealer's customers"""
    
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can access CRM")
    
    customers = await db.customers.find({"dealer_id": current_user.id}).sort("created_at", -1).limit(limit).to_list(length=None)
    return [Customer(**customer) for customer in customers]

@api_router.post("/crm/customers", response_model=Customer)
async def create_customer(customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    """Create new customer"""
    
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can create customers")
    
    # Check if customer already exists
    existing = await db.customers.find_one({"dealer_id": current_user.id, "email": customer_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Customer with this email already exists")
    
    customer = Customer(**customer_data.dict(), dealer_id=current_user.id)
    await db.customers.insert_one(customer.dict())
    
    return customer

@api_router.get("/crm/customers/{customer_id}", response_model=Customer)
async def get_customer(customer_id: str, current_user: User = Depends(get_current_user)):
    """Get customer details"""
    
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can access CRM")
    
    customer = await db.customers.find_one({"id": customer_id, "dealer_id": current_user.id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    return Customer(**customer)

@api_router.put("/crm/customers/{customer_id}", response_model=Customer)
async def update_customer(customer_id: str, customer_data: CustomerCreate, current_user: User = Depends(get_current_user)):
    """Update customer"""
    
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can update customers")
    
    # Check if customer exists
    existing = await db.customers.find_one({"id": customer_id, "dealer_id": current_user.id})
    if not existing:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    update_data = customer_data.dict()
    update_data["last_contact"] = datetime.now(timezone.utc)
    
    await db.customers.update_one({"id": customer_id}, {"$set": update_data})
    
    updated_customer = await db.customers.find_one({"id": customer_id})
    return Customer(**updated_customer)

@api_router.get("/crm/customers/{customer_id}/sales", response_model=List[Sale])
async def get_customer_sales(customer_id: str, current_user: User = Depends(get_current_user)):
    """Get customer's purchase history"""
    
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can access sales data")
    
    sales = await db.sales.find({"customer_id": customer_id, "dealer_id": current_user.id}).sort("sale_date", -1).to_list(length=None)
    return [Sale(**sale) for sale in sales]

@api_router.post("/crm/sales", response_model=Sale)
async def record_sale(sale_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Record a new sale"""
    
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can record sales")
    
    # Verify customer and car exist
    customer = await db.customers.find_one({"id": sale_data["customer_id"], "dealer_id": current_user.id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    car = await db.cars.find_one({"id": sale_data["car_id"], "dealer_id": current_user.id})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    sale = Sale(**sale_data, dealer_id=current_user.id)
    await db.sales.insert_one(sale.dict())
    
    # Update car status to sold
    await db.cars.update_one({"id": sale_data["car_id"]}, {"$set": {"status": "sold"}})
    
    return sale

@api_router.post("/crm/offers", response_model=PersonalOffer)
async def create_personal_offer(offer_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Create personal offer for customer"""
    
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can create offers")
    
    # Verify customer and car exist
    customer = await db.customers.find_one({"id": offer_data["customer_id"], "dealer_id": current_user.id})
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    car = await db.cars.find_one({"id": offer_data["car_id"], "dealer_id": current_user.id})
    if not car:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Calculate discount
    regular_price = car["price"]
    offer_price = offer_data["offer_price"]
    discount_percent = ((regular_price - offer_price) / regular_price) * 100
    
    offer = PersonalOffer(
        **offer_data, 
        dealer_id=current_user.id,
        regular_price=regular_price,
        discount_percent=discount_percent
    )
    await db.personal_offers.insert_one(offer.dict())
    
    # Send notification to customer
    try:
        # Email notification would go here if customer has email
        if customer.get("email"):
            # TODO: Send personal offer email with car details
            pass
            
    except Exception as e:
        logger.error(f"Failed to send offer notification: {e}")
    
    return offer

@api_router.get("/crm/offers", response_model=List[PersonalOffer])
async def get_personal_offers(current_user: User = Depends(get_current_user)):
    """Get dealer's personal offers"""
    
    if current_user.role != UserRole.DEALER:
        raise HTTPException(status_code=403, detail="Only dealers can view offers")
    
    offers = await db.personal_offers.find({"dealer_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    return [PersonalOffer(**offer) for offer in offers]

# Additional services routes (Insurance, Loans, Leasing)
@api_router.post("/services/insurance/quote", response_model=InsuranceQuote)
async def get_insurance_quote(
    car_id: str = Form(...),
    insurance_type: str = Form("OSAGO"),
    coverage_amount: Optional[float] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """Get insurance quote for a car"""
    
    # Verify car exists
    car_data = await db.cars.find_one({"id": car_id})
    if not car_data:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Mock insurance calculation (in real app, integrate with insurance APIs)
    car_value = car_data["price"]
    
    if insurance_type == "OSAGO":
        yearly_premium = min(car_value * 0.02, 15000)  # 2% of car value, max 15k
        coverage_amount = coverage_amount or 500000  # Standard OSAGO coverage
    elif insurance_type == "KASKO":
        yearly_premium = car_value * 0.08  # 8% for KASKO
        coverage_amount = coverage_amount or car_value
    else:  # FULL
        yearly_premium = car_value * 0.12  # 12% for full coverage
        coverage_amount = coverage_amount or car_value * 1.2
    
    monthly_premium = yearly_premium / 12
    
    quote = InsuranceQuote(
        user_id=current_user.id,
        car_id=car_id,
        insurance_type=insurance_type,
        coverage_amount=coverage_amount,
        monthly_premium=monthly_premium,
        yearly_premium=yearly_premium,
        provider="VELES Insurance Partner",
        valid_until=datetime.now(timezone.utc) + timedelta(days=30)
    )
    
    await db.insurance_quotes.insert_one(quote.dict())
    return quote

@api_router.get("/services/insurance/quotes", response_model=List[InsuranceQuote])
async def get_user_insurance_quotes(current_user: User = Depends(get_current_user)):
    """Get user's insurance quotes"""
    
    quotes = await db.insurance_quotes.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    return [InsuranceQuote(**quote) for quote in quotes]

@api_router.post("/services/loans/apply", response_model=LoanApplication)
async def apply_for_loan(loan_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Apply for auto loan"""
    
    # Verify car exists
    car_data = await db.cars.find_one({"id": loan_data["car_id"]})
    if not car_data:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Mock loan calculation
    loan_amount = loan_data["loan_amount"]
    term_months = loan_data["loan_term_months"]
    monthly_income = loan_data["monthly_income"]
    
    # Simple approval logic
    debt_to_income_ratio = (loan_amount / term_months) / monthly_income
    
    if debt_to_income_ratio <= 0.3 and monthly_income >= 50000:  # 30% DTI ratio, min income 50k
        interest_rate = 12.5  # 12.5% annual
        monthly_payment = (loan_amount * (interest_rate/100/12) * (1 + interest_rate/100/12)**term_months) / ((1 + interest_rate/100/12)**term_months - 1)
        status = "approved"
    else:
        interest_rate = None
        monthly_payment = None
        status = "pending"  # Would require manual review
    
    application = LoanApplication(
        **loan_data,
        user_id=current_user.id,
        interest_rate=interest_rate,
        monthly_payment=monthly_payment,
        status=status,
        bank_partner="VELES Bank Partner"
    )
    
    if status == "approved":
        application.approved_at = datetime.now(timezone.utc)
    
    await db.loan_applications.insert_one(application.dict())
    return application

@api_router.get("/services/loans/applications", response_model=List[LoanApplication])
async def get_loan_applications(current_user: User = Depends(get_current_user)):
    """Get user's loan applications"""
    
    applications = await db.loan_applications.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    return [LoanApplication(**app) for app in applications]

@api_router.post("/services/leasing/apply", response_model=LeaseApplication)
async def apply_for_lease(lease_data: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Apply for car leasing"""
    
    # Verify car exists
    car_data = await db.cars.find_one({"id": lease_data["car_id"]})
    if not car_data:
        raise HTTPException(status_code=404, detail="Car not found")
    
    car_price = car_data["price"]
    term_months = lease_data["lease_term_months"]
    
    # Mock leasing calculation
    down_payment = car_price * 0.2  # 20% down
    residual_value = car_price * 0.4  # 40% residual value
    monthly_payment = (car_price - down_payment - residual_value) / term_months
    
    application = LeaseApplication(
        **lease_data,
        user_id=current_user.id,
        monthly_payment=monthly_payment,
        down_payment=down_payment,
        residual_value=residual_value,
        status="approved",  # Simplified approval
        leasing_company="VELES Leasing Partner",
        approved_at=datetime.now(timezone.utc)
    )
    
    await db.lease_applications.insert_one(application.dict())
    return application

@api_router.get("/services/leasing/applications", response_model=List[LeaseApplication])
async def get_lease_applications(current_user: User = Depends(get_current_user)):
    """Get user's lease applications"""
    
    applications = await db.lease_applications.find({"user_id": current_user.id}).sort("created_at", -1).to_list(length=None)
    return [LeaseApplication(**app) for app in applications]

# Admin panel routes
@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    """Get platform statistics for admins"""
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access statistics")
    
    # Collect various statistics
    total_users = await db.users.count_documents({})
    total_dealers = await db.dealers.count_documents({})
    total_cars = await db.cars.count_documents({})
    active_auctions = await db.auctions.count_documents({"status": "active"})
    total_reviews = await db.reviews.count_documents({})
    total_transactions = await db.transactions.count_documents({})
    
    # Recent activity
    recent_users = await db.users.count_documents({
        "created_at": {"$gte": datetime.now(timezone.utc) - timedelta(days=30)}
    })
    
    recent_sales = await db.sales.count_documents({
        "sale_date": {"$gte": datetime.now(timezone.utc) - timedelta(days=30)}
    })
    
    # Calculate revenue (mock calculation)
    sales = await db.sales.find({
        "sale_date": {"$gte": datetime.now(timezone.utc) - timedelta(days=30)}
    }).to_list(length=None)
    
    monthly_revenue = sum([sale.get("commission", sale["sale_price"] * 0.05) for sale in sales])
    
    return {
        "overview": {
            "total_users": total_users,
            "total_dealers": total_dealers,
            "total_cars": total_cars,
            "active_auctions": active_auctions,
            "total_reviews": total_reviews,
            "total_transactions": total_transactions
        },
        "monthly_stats": {
            "new_users": recent_users,
            "sales_count": recent_sales,
            "revenue": monthly_revenue
        }
    }

@api_router.get("/admin/users", response_model=List[User])
async def get_all_users(
    current_user: User = Depends(get_current_user),
    role: Optional[str] = None,
    limit: int = Query(50, le=200)
):
    """Get all platform users for admin management"""
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can manage users")
    
    filter_query = {}
    if role:
        filter_query["role"] = role
    
    users = await db.users.find(filter_query).sort("created_at", -1).limit(limit).to_list(length=None)
    return [User(**user) for user in users]

@api_router.put("/admin/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool = Form(...),
    current_user: User = Depends(get_current_user)
):
    """Activate/deactivate user account"""
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can manage users")
    
    result = await db.users.update_one({"id": user_id}, {"$set": {"is_active": is_active}})
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    action = "activated" if is_active else "deactivated"
    return {"message": f"User {action} successfully"}

@api_router.get("/admin/content/pending")
async def get_pending_content(current_user: User = Depends(get_current_user)):
    """Get content requiring moderation"""
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can moderate content")
    
    # Cars awaiting approval (mock - add moderation status to Car model later)
    recent_cars = await db.cars.find({
        "created_at": {"$gte": datetime.now(timezone.utc) - timedelta(days=7)}
    }).sort("created_at", -1).limit(20).to_list(length=None)
    
    # Recent reviews
    recent_reviews = await db.reviews.find({}).sort("created_at", -1).limit(10).to_list(length=None)
    
    # Recent dealer registrations
    recent_dealers = await db.dealers.find({
        "created_at": {"$gte": datetime.now(timezone.utc) - timedelta(days=7)}
    }).sort("created_at", -1).to_list(length=None)
    
    return {
        "pending_cars": [Car(**car) for car in recent_cars],
        "recent_reviews": [Review(**review) for review in recent_reviews],
        "pending_dealers": [Dealer(**dealer) for dealer in recent_dealers]
    }

@api_router.post("/admin/cars/{car_id}/approve")
async def approve_car(car_id: str, current_user: User = Depends(get_current_user)):
    """Approve car listing"""
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can approve content")
    
    result = await db.cars.update_one(
        {"id": car_id}, 
        {"$set": {"approved": True, "approved_at": datetime.now(timezone.utc), "approved_by": current_user.id}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Car not found")
    
    return {"message": "Car approved successfully"}

@api_router.delete("/admin/reviews/{review_id}")
async def delete_review(review_id: str, current_user: User = Depends(get_current_user)):
    """Delete inappropriate review"""
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can moderate reviews")
    
    review_data = await db.reviews.find_one({"id": review_id})
    if not review_data:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Delete review
    await db.reviews.delete_one({"id": review_id})
    
    # Update dealer rating
    dealer_id = review_data["dealer_id"]
    reviews = await db.reviews.find({"dealer_id": dealer_id}).to_list(length=None)
    
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        await db.dealers.update_one(
            {"id": dealer_id},
            {"$set": {"rating": avg_rating, "reviews_count": len(reviews)}}
        )
    else:
        await db.dealers.update_one(
            {"id": dealer_id},
            {"$set": {"rating": 0.0, "reviews_count": 0}}
        )
    
    return {"message": "Review deleted successfully"}

@api_router.get("/admin/reports/sales")
async def get_sales_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Generate sales report for admins"""
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access reports")
    
    # Default to last 30 days if no dates provided
    end_dt = datetime.now(timezone.utc)
    start_dt = end_dt - timedelta(days=30)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    # Get sales in date range
    sales = await db.sales.find({
        "sale_date": {"$gte": start_dt, "$lte": end_dt}
    }).to_list(length=None)
    
    # Calculate metrics
    total_sales = len(sales)
    total_revenue = sum(sale["sale_price"] for sale in sales)
    average_sale = total_revenue / total_sales if total_sales > 0 else 0
    
    # Top dealers by sales count
    dealer_sales = {}
    for sale in sales:
        dealer_id = sale["dealer_id"]
        if dealer_id not in dealer_sales:
            dealer_sales[dealer_id] = {"count": 0, "revenue": 0}
        dealer_sales[dealer_id]["count"] += 1
        dealer_sales[dealer_id]["revenue"] += sale["sale_price"]
    
    # Get dealer names
    top_dealers = []
    for dealer_id, stats in sorted(dealer_sales.items(), key=lambda x: x[1]["count"], reverse=True)[:5]:
        dealer = await db.dealers.find_one({"id": dealer_id})
        if dealer:
            top_dealers.append({
                "dealer_name": dealer["company_name"],
                "sales_count": stats["count"],
                "revenue": stats["revenue"]
            })
    
    return {
        "period": {
            "start_date": start_dt.isoformat(),
            "end_date": end_dt.isoformat()
        },
        "metrics": {
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "average_sale": average_sale
        },
        "top_dealers": top_dealers
    }

# AI-powered endpoints
@api_router.get("/ai/recommendations", response_model=List[Car])
async def get_ai_recommendations(
    current_user: User = Depends(get_current_user),
    limit: int = Query(5, le=10)
):
    """Get AI-powered car recommendations for user"""
    
    try:
        # Get user preferences from view history and favorites
        view_history = await db.view_history.find({"user_id": current_user.id}).limit(20).to_list(length=None)
        favorites = await db.favorites.find({"user_id": current_user.id}).to_list(length=None)
        
        # Build user preference profile
        user_preferences = {
            "user_id": current_user.id,
            "viewed_cars_count": len(view_history),
            "favorites_count": len(favorites),
            "budget_range": "auto-detect",  # Could be enhanced with explicit user input
            "preferred_brands": [],  # Could be derived from history
            "lifestyle": "detect_from_behavior"  # Could be enhanced with user profile
        }
        
        # Get available cars
        cars = await db.cars.find({"status": "available"}).limit(50).to_list(length=None)
        
        # Get AI recommendations
        recommended_cars = await ai_recommendation_service.get_personalized_recommendations(
            user_preferences, cars
        )
        
        return [Car(**car) for car in recommended_cars[:limit]]
        
    except Exception as e:
        logger.error(f"AI recommendations error: {e}")
        # Fallback to regular cars
        cars = await db.cars.find({"status": "available"}).limit(limit).to_list(length=None)
        return [Car(**car) for car in cars]

@api_router.post("/ai/search")
async def ai_powered_search(
    query: str = Form(...),
    limit: int = Query(20, le=50)
):
    """Natural language search for cars using AI"""
    
    try:
        # Get available cars
        cars = await db.cars.find({"status": "available"}).to_list(length=None)
        
        # Process with AI
        matching_cars = await process_natural_language_search(query, cars)
        
        return {
            "query": query,
            "results": [Car(**car) for car in matching_cars[:limit]],
            "total_found": len(matching_cars),
            "search_type": "ai_natural_language"
        }
        
    except Exception as e:
        logger.error(f"AI search error: {e}")
        # Fallback to regular search
        cars = await db.cars.find({
            "$or": [
                {"brand": {"$regex": query, "$options": "i"}},
                {"model": {"$regex": query, "$options": "i"}},
                {"description": {"$regex": query, "$options": "i"}}
            ]
        }).limit(limit).to_list(length=None)
        
        return {
            "query": query,
            "results": [Car(**car) for car in cars],
            "total_found": len(cars),
            "search_type": "fallback_text"
        }

@api_router.post("/ai/chat")
async def chat_with_assistant(
    message: str = Form(...),
    session_id: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Chat with AI virtual assistant"""
    
    try:
        # Prepare context
        context = {}
        if current_user:
            context["user_role"] = current_user.role
            context["user_id"] = current_user.id
        
        # Get AI response
        ai_response = await ai_virtual_assistant.handle_customer_query(
            query=message,
            context=context,
            session_id=session_id
        )
        
        # Store chat history if user is logged in
        if current_user:
            chat_message = ChatMessage(
                session_id=ai_response["session_id"],
                user_id=current_user.id,
                message=message,
                response=ai_response["response"]
            )
            await db.chat_history.insert_one(chat_message)
        
        return ai_response
        
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        return {
            "response": "Извините, произошла ошибка. Попробуйте позже или обратитесь к менеджеру.",
            "type": "error",
            "suggested_actions": ["Связаться с поддержкой"],
            "needs_human": True,
            "session_id": session_id or f"error_{uuid.uuid4()}"
        }

@api_router.get("/ai/chat/history")
async def get_chat_history(
    session_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, le=100)
):
    """Get user's chat history"""
    
    filter_query = {"user_id": current_user.id}
    if session_id:
        filter_query["session_id"] = session_id
    
    chat_history = await db.chat_history.find(filter_query).sort("timestamp", -1).limit(limit).to_list(length=None)
    return chat_history

@api_router.post("/ai/enhance-description/{car_id}")
async def enhance_car_description(
    car_id: str,
    current_user: User = Depends(get_current_user)
):
    """Generate AI-enhanced description for a car"""
    
    if current_user.role not in [UserRole.DEALER, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only dealers can enhance descriptions")
    
    # Get car data
    car_data = await db.cars.find_one({"id": car_id})
    if not car_data:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Check permissions
    if car_data["dealer_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="You can only enhance your own cars")
    
    try:
        # Generate AI description
        enhanced_description = await ai_recommendation_service.generate_car_description(car_data)
        
        # Update car description
        await db.cars.update_one(
            {"id": car_id},
            {"$set": {"ai_enhanced_description": enhanced_description}}
        )
        
        return {
            "car_id": car_id,
            "enhanced_description": enhanced_description,
            "original_description": car_data.get("description", "")
        }
        
    except Exception as e:
        logger.error(f"AI description enhancement error: {e}")
        raise HTTPException(status_code=500, detail="Failed to enhance description")

@api_router.get("/ai/market-insights")
async def get_market_insights(current_user: User = Depends(get_current_user)):
    """Get AI-powered market insights and analytics"""
    
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can access market insights")
    
    try:
        # Get recent sales and cars data
        sales_data = await db.sales.find({}).sort("sale_date", -1).limit(100).to_list(length=None)
        cars_data = await db.cars.find({"status": "available"}).limit(100).to_list(length=None)
        
        # Generate AI insights
        insights = await ai_analytics_service.generate_market_insights(sales_data, cars_data)
        
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "data_points": {
                "sales_analyzed": len(sales_data),
                "cars_analyzed": len(cars_data)
            },
            "insights": insights
        }
        
    except Exception as e:
        logger.error(f"AI market insights error: {e}")
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "insights": {"error": "Failed to generate insights"},
            "fallback": True
        }

# Vehicle type specific routes
@api_router.get("/vehicles/{vehicle_type}", response_model=List[Car])
async def get_vehicles_by_type(
    vehicle_type: VehicleType,
    brand: Optional[str] = None,
    model: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_year: Optional[int] = None,
    max_year: Optional[int] = None,
    is_premium: Optional[bool] = None,
    limit: int = Query(20, le=100)
):
    """Get vehicles by type (cars, motorcycles, boats, planes)"""
    
    filter_query = {"status": "available", "vehicle_type": vehicle_type.value}
    
    if brand:
        filter_query["brand"] = {"$regex": brand, "$options": "i"}
    if model:
        filter_query["model"] = {"$regex": model, "$options": "i"}
    if min_price is not None:
        filter_query.setdefault("price", {})["$gte"] = min_price
    if max_price is not None:
        filter_query.setdefault("price", {})["$lte"] = max_price
    if min_year is not None:
        filter_query.setdefault("year", {})["$gte"] = min_year
    if max_year is not None:
        filter_query.setdefault("year", {})["$lte"] = max_year
    if is_premium is not None:
        filter_query["is_premium"] = is_premium
    
    vehicles = await db.cars.find(filter_query).limit(limit).to_list(length=None)
    return [Car(**vehicle) for vehicle in vehicles]

@api_router.get("/vehicles/stats")
async def get_vehicles_stats():
    """Get statistics by vehicle type"""
    
    stats = {}
    
    for vehicle_type in VehicleType:
        count = await db.cars.count_documents({
            "vehicle_type": vehicle_type.value,
            "status": "available"
        })
        
        # Get price range
        vehicles = await db.cars.find({
            "vehicle_type": vehicle_type.value,
            "status": "available"
        }).to_list(length=None)
        
        if vehicles:
            prices = [v["price"] for v in vehicles]
            min_price = min(prices)
            max_price = max(prices)
            avg_price = sum(prices) / len(prices)
        else:
            min_price = max_price = avg_price = 0
        
        stats[vehicle_type.value] = {
            "count": count,
            "price_range": {
                "min": min_price,
                "max": max_price,
                "average": avg_price
            }
        }
    
    return stats

# Include routers
app.include_router(api_router)
app.include_router(payments_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()