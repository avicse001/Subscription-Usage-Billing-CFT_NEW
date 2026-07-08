"""Subscription Usage & Billing System - FastAPI + MongoDB.

Endpoints:
    POST   /api/usage
    GET    /api/users/{user_id}/current-usage
    GET    /api/users/{user_id}/billing-summary

Supporting CRUD:
    POST   /api/users
    GET    /api/users
    POST   /api/plans
    GET    /api/plans
    POST   /api/subscriptions
    GET    /api/subscriptions
    POST   /api/seed        -> Seeds demo users, plans, subscriptions
"""

from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="Subscription Usage & Billing API")
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class UserCreate(BaseModel):
    name: str


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str


class PlanCreate(BaseModel):
    name: str
    monthlyQuota: int
    extraChargePerUnit: float


class Plan(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    monthlyQuota: int
    extraChargePerUnit: float


class SubscriptionCreate(BaseModel):
    userId: str
    planId: str
    startDate: Optional[str] = None  # ISO date string
    isActive: bool = True


class Subscription(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    planId: str
    startDate: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).date().isoformat()
    )
    isActive: bool = True


class UsageCreate(BaseModel):
    userId: str
    action: str
    usedUnits: int


class UsageRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    userId: str
    action: str
    usedUnits: int
    createdAt: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


# ---------- Helpers ----------
def _round2(value: float) -> float:
    return float(
        Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    )


def _current_month_range():
    now = datetime.now(timezone.utc)
    start = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    if now.month == 12:
        end = datetime(now.year + 1, 1, 1, tzinfo=timezone.utc)
    else:
        end = datetime(now.year, now.month + 1, 1, tzinfo=timezone.utc)
    return start.isoformat(), end.isoformat()


async def _get_active_plan_for_user(user_id: str):
    sub = await db.subscriptions.find_one(
        {"userId": user_id, "isActive": True}, {"_id": 0}
    )
    if not sub:
        return None, None
    plan = await db.plans.find_one({"id": sub["planId"]}, {"_id": 0})
    return sub, plan


async def _total_usage_this_month(user_id: str) -> int:
    start, end = _current_month_range()
    cursor = db.usage_records.find(
        {
            "userId": user_id,
            "createdAt": {"$gte": start, "$lt": end},
        },
        {"_id": 0, "usedUnits": 1},
    )
    total = 0
    async for doc in cursor:
        total += int(doc.get("usedUnits", 0))
    return total


# ---------- User endpoints ----------
@api_router.post("/users", response_model=User)
async def create_user(payload: UserCreate):
    user = User(name=payload.name)
    await db.users.insert_one(user.model_dump())
    return user


@api_router.get("/users", response_model=List[User])
async def list_users():
    users = await db.users.find({}, {"_id": 0}).to_list(1000)
    return users


# ---------- Plan endpoints ----------
@api_router.post("/plans", response_model=Plan)
async def create_plan(payload: PlanCreate):
    plan = Plan(**payload.model_dump())
    await db.plans.insert_one(plan.model_dump())
    return plan


@api_router.get("/plans", response_model=List[Plan])
async def list_plans():
    plans = await db.plans.find({}, {"_id": 0}).to_list(1000)
    return plans


# ---------- Subscription endpoints ----------
@api_router.post("/subscriptions", response_model=Subscription)
async def create_subscription(payload: SubscriptionCreate):
    if not await db.users.find_one({"id": payload.userId}):
        raise HTTPException(status_code=404, detail="User not found")
    if not await db.plans.find_one({"id": payload.planId}):
        raise HTTPException(status_code=404, detail="Plan not found")

    data = payload.model_dump()
    if not data.get("startDate"):
        data["startDate"] = datetime.now(timezone.utc).date().isoformat()

    # Deactivate any existing active subscription for this user
    if payload.isActive:
        await db.subscriptions.update_many(
            {"userId": payload.userId, "isActive": True},
            {"$set": {"isActive": False}},
        )

    sub = Subscription(**data)
    await db.subscriptions.insert_one(sub.model_dump())
    return sub


@api_router.get("/subscriptions", response_model=List[Subscription])
async def list_subscriptions():
    subs = await db.subscriptions.find({}, {"_id": 0}).to_list(1000)
    return subs


# ---------- Usage endpoints ----------
@api_router.post("/usage", response_model=UsageRecord)
async def record_usage(payload: UsageCreate):
    if not await db.users.find_one({"id": payload.userId}):
        raise HTTPException(status_code=404, detail="User not found")
    if payload.usedUnits <= 0:
        raise HTTPException(
            status_code=400, detail="usedUnits must be a positive integer"
        )

    record = UsageRecord(**payload.model_dump())
    await db.usage_records.insert_one(record.model_dump())
    return record


@api_router.get("/users/{user_id}/current-usage")
async def current_usage(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sub, plan = await _get_active_plan_for_user(user_id)
    total_used = await _total_usage_this_month(user_id)

    if not plan:
        return {
            "userId": user_id,
            "totalUsed": total_used,
            "remainingUnits": 0,
            "activePlan": None,
            "subscription": None,
        }

    remaining = max(plan["monthlyQuota"] - total_used, 0)
    return {
        "userId": user_id,
        "totalUsed": total_used,
        "remainingUnits": remaining,
        "activePlan": plan,
        "subscription": sub,
    }


@api_router.get("/users/{user_id}/billing-summary")
async def billing_summary(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sub, plan = await _get_active_plan_for_user(user_id)
    total_used = await _total_usage_this_month(user_id)

    if not plan:
        return {
            "userId": user_id,
            "totalUsage": total_used,
            "planQuota": 0,
            "extraUnits": 0,
            "extraCharges": 0.0,
            "activePlan": None,
            "subscription": None,
        }

    quota = plan["monthlyQuota"]
    extra_units = max(total_used - quota, 0)
    extra_charges = _round2(extra_units * float(plan["extraChargePerUnit"]))

    return {
        "userId": user_id,
        "totalUsage": total_used,
        "planQuota": quota,
        "extraUnits": extra_units,
        "extraCharges": extra_charges,
        "activePlan": plan,
        "subscription": sub,
    }


# ---------- Seed / health ----------
@api_router.post("/seed")
async def seed_demo_data():
    """Seed a small demo dataset. Idempotent: skips if users already exist."""
    existing = await db.users.count_documents({})
    if existing > 0:
        users = await db.users.find({}, {"_id": 0}).to_list(1000)
        plans = await db.plans.find({}, {"_id": 0}).to_list(1000)
        return {"seeded": False, "users": users, "plans": plans}

    plan_basic = Plan(name="Basic", monthlyQuota=100, extraChargePerUnit=0.50)
    plan_pro = Plan(name="Pro", monthlyQuota=500, extraChargePerUnit=0.25)
    plan_enterprise = Plan(
        name="Enterprise", monthlyQuota=2000, extraChargePerUnit=0.10
    )
    await db.plans.insert_many(
        [plan_basic.model_dump(), plan_pro.model_dump(), plan_enterprise.model_dump()]
    )

    alice = User(name="Alice")
    bob = User(name="Bob")
    await db.users.insert_many([alice.model_dump(), bob.model_dump()])

    sub1 = Subscription(userId=alice.id, planId=plan_basic.id, isActive=True)
    sub2 = Subscription(userId=bob.id, planId=plan_pro.id, isActive=True)
    await db.subscriptions.insert_many([sub1.model_dump(), sub2.model_dump()])

    return {
        "seeded": True,
        "users": [alice.model_dump(), bob.model_dump()],
        "plans": [
            plan_basic.model_dump(),
            plan_pro.model_dump(),
            plan_enterprise.model_dump(),
        ],
    }


@api_router.get("/")
async def root():
    return {"message": "Subscription Usage & Billing API"}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
