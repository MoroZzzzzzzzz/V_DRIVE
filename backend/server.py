from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
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
from datetime import datetime, timezone
from enum import Enum
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
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
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CarCreate(BaseModel):
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
    
    if datetime.now(timezone.utc) > auction.end_time:
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

# File upload route
@api_router.post("/upload")
async def upload_file(file: str = Field(...), filename: str = Field(...), current_user: User = Depends(get_current_user)):
    # For now, return a mock URL - will implement proper file storage later
    file_url = f"https://storage.veledrive.com/{filename}"
    return {"url": file_url}

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