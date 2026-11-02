from fastapi import APIRouter, Request, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel
from app.data import supabase_db

router = APIRouter(prefix="/api/push", tags=["Push Notifications"])

class PushSubscribeInput(BaseModel):
    subscription: Dict[str, Any]
    userId: Optional[str] = "admin"
    userRole: Optional[str] = "admin"
    userAgent: Optional[str] = "Mobile Device"

@router.post("/subscribe")
def subscribe_device(payload: PushSubscribeInput):
    sub = payload.subscription
    endpoint = sub.get("endpoint")
    keys = sub.get("keys", {})
    p256dh = keys.get("p256dh")
    auth = keys.get("auth")

    if not endpoint or not p256dh or not auth:
        raise HTTPException(status_code=400, detail="Invalid push subscription data")

    sql = """
    INSERT INTO public.push_subscriptions (
        endpoint, p256dh, auth, user_id, user_role, user_agent, updated_at
    ) VALUES (
        %s, %s, %s, %s, %s, %s, NOW()
    )
    ON CONFLICT (endpoint) DO UPDATE SET
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth,
        user_id = EXCLUDED.user_id,
        user_role = EXCLUDED.user_role,
        user_agent = EXCLUDED.user_agent,
        updated_at = NOW();
    """
    success = supabase_db.execute(sql, (
        endpoint, p256dh, auth, payload.userId, payload.userRole, payload.userAgent
    ))

    return {
        "success": success,
        "message": "Push subscription saved successfully" if success else "Failed to save subscription"
    }

@router.get("/subscriptions")
def get_subscriptions():
    subs = supabase_db.fetch_all("SELECT id, user_id, user_role, user_agent, created_at, updated_at FROM public.push_subscriptions ORDER BY updated_at DESC;")
    return {
        "success": True,
        "count": len(subs),
        "subscriptions": subs
    }

