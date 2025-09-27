from yookassa import Configuration, Payment, Refund
from yookassa.domain.notification import WebhookNotificationFactory
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks, Depends
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, Dict, Any
import uuid
import hmac
import hashlib
import json
import os
from decimal import Decimal
from datetime import datetime, timezone
import logging

# Configure YooKassa
YOOKASSA_SHOP_ID = os.environ.get('YOOKASSA_SHOP_ID', 'test_shop_id')
YOOKASSA_SECRET_KEY = os.environ.get('YOOKASSA_SECRET_KEY', 'test_secret_key')
YOOKASSA_WEBHOOK_SECRET = os.environ.get('YOOKASSA_WEBHOOK_SECRET', 'webhook_secret')

Configuration.configure(YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY)

# Setup logging
logger = logging.getLogger("payments")

# Router
router = APIRouter(prefix="/api/payments", tags=["payments"])

# Models
class PaymentRequest(BaseModel):
    amount: Decimal = Field(..., gt=0, le=Decimal('1000000'), description="Payment amount in rubles")
    description: str = Field(..., min_length=1, max_length=128)
    user_email: EmailStr
    return_url: str = Field(..., description="Return URL after payment")
    payment_type: str = Field(..., description="Type of payment")
    
    @validator('amount')
    def validate_amount_precision(cls, v):
        # Ensure proper decimal precision for rubles (2 decimal places max)
        if v.as_tuple().exponent < -2:
            raise ValueError('Amount precision cannot exceed 2 decimal places')
        return v.quantize(Decimal('0.01'))
    
    @validator('payment_type')
    def validate_payment_type(cls, v):
        allowed_types = ['subscription', 'commission', 'premium_upgrade', 'dealer_fee']
        if v not in allowed_types:
            raise ValueError(f'Payment type must be one of: {allowed_types}')
        return v

class PaymentResponse(BaseModel):
    payment_id: str
    confirmation_url: str
    status: str
    amount: Dict[str, str]

class SubscriptionPlan(BaseModel):
    name: str
    price: Decimal
    duration_months: int
    features: list

# Subscription plans
SUBSCRIPTION_PLANS = {
    "premium": SubscriptionPlan(
        name="Премиум подписка",
        price=Decimal("999.00"),
        duration_months=1,
        features=[
            "Приоритет в каталоге",
            "Расширенная статистика",
            "Персональный менеджер",
            "Без комиссий до 10 сделок"
        ]
    ),
    "business": SubscriptionPlan(
        name="Бизнес подписка", 
        price=Decimal("2999.00"),
        duration_months=1,
        features=[
            "Все функции Премиум",
            "Неограниченные сделки без комиссий",
            "API доступ",
            "Персональная поддержка 24/7",
            "Брендированная страница дилера"
        ]
    ),
    "enterprise": SubscriptionPlan(
        name="Корпоративная подписка",
        price=Decimal("9999.00"),
        duration_months=1,
        features=[
            "Все функции Бизнес",
            "Интеграция с CRM",
            "Персональный аккаунт-менеджер",
            "Техническая поддержка разработки",
            "SLA 99.9%"
        ]
    )
}

def create_payment_data(request: PaymentRequest, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
    """Create payment data for YooKassa API"""
    
    payment_metadata = {
        "user_email": request.user_email,
        "payment_type": request.payment_type,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    if metadata:
        payment_metadata.update(metadata)
    
    return {
        "amount": {
            "value": str(request.amount),
            "currency": "RUB"
        },
        "confirmation": {
            "type": "redirect",
            "return_url": request.return_url
        },
        "capture": True,  # Auto-capture payment
        "description": request.description,
        "metadata": payment_metadata,
        "receipt": {
            "customer": {
                "email": request.user_email
            },
            "items": [{
                "description": request.description,
                "quantity": "1",
                "amount": {
                    "value": str(request.amount),
                    "currency": "RUB"
                },
                "vat_code": "1",  # VAT 18%
                "payment_mode": "full_payment",
                "payment_subject": "service"
            }]
        }
    }

def verify_webhook_signature(body: bytes, headers: dict, secret: str) -> bool:
    """Verify YooKassa webhook signature"""
    signature = headers.get("HTTP_YOOKASSA_SIGNATURE") or headers.get("yookassa-signature")
    if not signature:
        return False
    
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        body,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

# Routes
@router.post("/create", response_model=PaymentResponse)
async def create_payment(request: PaymentRequest):
    """Create a new payment"""
    try:
        # Additional metadata based on payment type
        metadata = {}
        
        if request.payment_type == "subscription":
            # For subscription payments, add plan info
            metadata["subscription_type"] = "premium"  # Default, can be dynamic
            
        elif request.payment_type == "commission":
            # For commission payments, add dealer info
            metadata["commission_type"] = "monthly_fee"
        
        # Create payment data
        payment_data = create_payment_data(request, metadata)
        
        # Create payment with YooKassa
        payment = Payment.create(payment_data, str(uuid.uuid4()))
        
        logger.info(f"Payment created: {payment.id}, amount: {request.amount}, type: {request.payment_type}")
        
        return PaymentResponse(
            payment_id=payment.id,
            confirmation_url=payment.confirmation.confirmation_url,
            status=payment.status,
            amount={
                "value": payment.amount.value,
                "currency": payment.amount.currency
            }
        )
        
    except Exception as e:
        logger.error(f"Payment creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment creation failed: {str(e)}")

@router.get("/plans")
async def get_subscription_plans():
    """Get available subscription plans"""
    return {
        "plans": {
            plan_id: {
                "name": plan.name,
                "price": float(plan.price),
                "currency": "RUB", 
                "duration_months": plan.duration_months,
                "features": plan.features
            }
            for plan_id, plan in SUBSCRIPTION_PLANS.items()
        }
    }

@router.post("/subscription/{plan_id}")
async def create_subscription_payment(
    plan_id: str,
    user_email: EmailStr,
    return_url: str
):
    """Create subscription payment for specific plan"""
    
    if plan_id not in SUBSCRIPTION_PLANS:
        raise HTTPException(status_code=404, detail="Subscription plan not found")
    
    plan = SUBSCRIPTION_PLANS[plan_id]
    
    request = PaymentRequest(
        amount=plan.price,
        description=f"{plan.name} - {plan.duration_months} мес.",
        user_email=user_email,
        return_url=return_url,
        payment_type="subscription"
    )
    
    # Create payment with plan-specific metadata
    metadata = {
        "subscription_plan": plan_id,
        "subscription_duration": plan.duration_months,
        "subscription_features": ",".join(plan.features)
    }
    
    try:
        payment_data = create_payment_data(request, metadata)
        payment = Payment.create(payment_data, str(uuid.uuid4()))
        
        return PaymentResponse(
            payment_id=payment.id,
            confirmation_url=payment.confirmation.confirmation_url,
            status=payment.status,
            amount={
                "value": payment.amount.value,
                "currency": payment.amount.currency
            }
        )
        
    except Exception as e:
        logger.error(f"Subscription payment creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Subscription payment failed: {str(e)}")

@router.get("/{payment_id}/status")
async def get_payment_status(payment_id: str):
    """Get payment status"""
    try:
        payment = Payment.find_one(payment_id)
        
        response_data = {
            "payment_id": payment.id,
            "status": payment.status,
            "paid": payment.paid,
            "amount": {
                "value": payment.amount.value,
                "currency": payment.amount.currency
            },
            "created_at": payment.created_at,
            "metadata": payment.metadata
        }
        
        if payment.status == "succeeded":
            response_data["captured_at"] = payment.captured_at
            
        elif payment.status == "canceled" and payment.cancellation_details:
            response_data["cancellation_details"] = {
                "party": payment.cancellation_details.party,
                "reason": payment.cancellation_details.reason
            }
            
        return response_data
        
    except Exception as e:
        logger.error(f"Payment status error: {str(e)}")
        raise HTTPException(status_code=404, detail="Payment not found")

@router.post("/{payment_id}/cancel")
async def cancel_payment(payment_id: str):
    """Cancel a payment"""
    try:
        payment = Payment.find_one(payment_id)
        
        if payment.status not in ["pending", "waiting_for_capture"]:
            raise HTTPException(
                status_code=400,
                detail=f"Payment cannot be canceled. Current status: {payment.status}"
            )
        
        canceled_payment = Payment.cancel(payment_id, str(uuid.uuid4()))
        
        logger.info(f"Payment canceled: {payment_id}")
        
        return {
            "payment_id": canceled_payment.id,
            "status": canceled_payment.status,
            "canceled_at": canceled_payment.canceled_at
        }
        
    except Exception as e:
        logger.error(f"Payment cancellation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Payment cancellation failed: {str(e)}")

@router.post("/{payment_id}/refund")
async def create_refund(payment_id: str, amount: Optional[Decimal] = None):
    """Create a refund for payment"""
    try:
        payment = Payment.find_one(payment_id)
        
        if payment.status != "succeeded":
            raise HTTPException(
                status_code=400,
                detail="Only succeeded payments can be refunded"
            )
        
        refund_data = {
            "payment_id": payment_id
        }
        
        if amount:
            if amount > Decimal(payment.amount.value):
                raise HTTPException(
                    status_code=400,
                    detail="Refund amount cannot exceed payment amount"
                )
            refund_data["amount"] = {
                "value": str(amount),
                "currency": "RUB"
            }
        
        refund = Refund.create(refund_data, str(uuid.uuid4()))
        
        logger.info(f"Refund created: {refund.id} for payment: {payment_id}")
        
        return {
            "refund_id": refund.id,
            "status": refund.status,
            "amount": {
                "value": refund.amount.value,
                "currency": refund.amount.currency
            }
        }
        
    except Exception as e:
        logger.error(f"Refund creation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Refund creation failed: {str(e)}")

@router.post("/webhook")
async def handle_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """Handle YooKassa webhook notifications"""
    try:
        # Get raw request body for signature verification
        body = await request.body()
        
        # Verify webhook signature
        if not verify_webhook_signature(body, dict(request.headers), YOOKASSA_WEBHOOK_SECRET):
            logger.warning("Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parse webhook payload
        payload = json.loads(body.decode('utf-8'))
        
        # Create notification object
        notification = WebhookNotificationFactory().create(payload)
        payment_object = notification.object
        
        logger.info(f"Webhook received: {notification.event} for payment {payment_object.id}")
        
        # Process webhook asynchronously to not block YooKassa
        background_tasks.add_task(
            process_webhook_event,
            notification.event,
            payment_object
        )
        
        return {"status": "ok"}
        
    except json.JSONDecodeError:
        logger.error("Invalid JSON in webhook payload")
        raise HTTPException(status_code=400, detail="Invalid JSON")
        
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        # Return success to prevent YooKassa retries for application errors
        return {"status": "error", "message": str(e)}

async def process_webhook_event(event_type: str, payment_object):
    """Process webhook events asynchronously"""
    try:
        if event_type == "payment.succeeded":
            await handle_payment_success(payment_object)
            
        elif event_type == "payment.canceled":
            await handle_payment_cancellation(payment_object)
            
        elif event_type == "refund.succeeded":
            await handle_refund_success(payment_object)
            
        else:
            logger.info(f"Unhandled webhook event: {event_type}")
            
    except Exception as e:
        logger.error(f"Event processing error for {event_type}: {str(e)}")

async def handle_payment_success(payment_object):
    """Handle successful payment"""
    payment_id = payment_object.id
    metadata = payment_object.metadata or {}
    
    logger.info(f"Processing successful payment: {payment_id}")
    
    payment_type = metadata.get("payment_type")
    user_email = metadata.get("user_email")
    
    if payment_type == "subscription":
        await activate_subscription(user_email, payment_object, metadata)
        
    elif payment_type == "commission":
        await process_commission_payment(payment_object, metadata)
        
    # Store payment record for audit
    await store_payment_record(payment_object)
    
    # Send confirmation email (mock)
    logger.info(f"Would send confirmation email to {user_email} for payment {payment_id}")

async def handle_payment_cancellation(payment_object):
    """Handle payment cancellation"""
    logger.info(f"Payment canceled: {payment_object.id}")
    
    # Clean up any pending operations
    # Update user interface if needed
    pass

async def handle_refund_success(refund_object):
    """Handle successful refund"""
    logger.info(f"Refund processed: {refund_object.id}")
    
    # Update subscription if needed
    # Send refund confirmation
    pass

async def activate_subscription(user_email: str, payment_object, metadata: Dict[str, Any]):
    """Activate user subscription after successful payment"""
    subscription_plan = metadata.get("subscription_plan", "premium")
    duration_months = int(metadata.get("subscription_duration", 1))
    
    logger.info(f"Activating {subscription_plan} subscription for {user_email}")
    
    # Here you would:
    # 1. Update user record in database with subscription details
    # 2. Set subscription expiration date
    # 3. Enable premium features
    # 4. Send welcome email with subscription details
    
    # Mock implementation
    subscription_data = {
        "user_email": user_email,
        "plan": subscription_plan,
        "payment_id": payment_object.id,
        "amount": payment_object.amount.value,
        "activated_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": None  # Calculate based on duration_months
    }
    
    logger.info(f"Subscription activated: {subscription_data}")

async def process_commission_payment(payment_object, metadata: Dict[str, Any]):
    """Process dealer commission payment"""
    commission_type = metadata.get("commission_type", "monthly_fee")
    
    logger.info(f"Processing {commission_type} commission payment: {payment_object.id}")
    
    # Here you would:
    # 1. Update dealer account with commission payment
    # 2. Reset commission counters if needed
    # 3. Update dealer status/privileges
    # 4. Generate invoice/receipt
    
    pass

async def store_payment_record(payment_object):
    """Store payment record for audit trail"""
    payment_record = {
        "payment_id": payment_object.id,
        "status": payment_object.status,
        "amount": payment_object.amount.value,
        "currency": payment_object.amount.currency,
        "created_at": payment_object.created_at,
        "captured_at": getattr(payment_object, 'captured_at', None),
        "metadata": payment_object.metadata
    }
    
    logger.info(f"Storing payment record: {payment_record}")
    
    # Here you would save to your database
    # await db.payments.insert_one(payment_record)