# backend/app/api/routes/ai_settings.py
import uuid
from typing import Any, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.models import AIApiKey, AISettings,CreditProfile, Message, UserCredits, UserPublic

router = APIRouter(prefix="/aisettings", tags=["aisettings"])

# API Key endpoints
@router.get("/api-keys", response_model=List[AIApiKey])
def get_api_keys(current_user: CurrentUser, session: SessionDep) -> Any:
    """
    Get all API keys for the current user.
    """
    statement = select(AIApiKey).where(AIApiKey.user_id == current_user.id)
    keys = session.exec(statement).all()
    return keys

@router.post("/api-keys", response_model=AIApiKey)
def create_api_key(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    provider: str,
    key: str
) -> Any:
    """
    Create a new API key.
    """
    api_key = AIApiKey(
        user_id=current_user.id,
        provider=provider,
        key=key
    )
    session.add(api_key)
    session.commit()
    session.refresh(api_key)
    return api_key

@router.delete("/api-keys/{key_id}", response_model=Message)
def delete_api_key(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    key_id: uuid.UUID
) -> Any:
    """
    Delete an API key.
    """
    key = session.get(AIApiKey, key_id)
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    if key.user_id != current_user.id and not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    session.delete(key)
    session.commit()
    return Message(message="API key deleted successfully")

# AI Settings endpoints
@router.get("/settings", response_model=AISettings)
def get_ai_settings(current_user: CurrentUser, session: SessionDep) -> Any:
    """
    Get AI settings for the current user.
    """
    statement = select(AISettings).where(AISettings.user_id == current_user.id)
    settings = session.exec(statement).first()
    
    if not settings:
        # Create default settings if none exist
        settings = AISettings(user_id=current_user.id)
        session.add(settings)
        session.commit()
        session.refresh(settings)
    
    return settings

@router.patch("/settings", response_model=AISettings)
def update_ai_settings(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    response_level: str = None,
    max_tokens: int = None,
    temperature: float = None
) -> Any:
    """
    Update AI settings for the current user.
    """
    statement = select(AISettings).where(AISettings.user_id == current_user.id)
    settings = session.exec(statement).first()
    
    if not settings:
        settings = AISettings(user_id=current_user.id)
        session.add(settings)
    
    if response_level is not None:
        settings.response_level = response_level
    if max_tokens is not None:
        settings.max_tokens = max_tokens
    if temperature is not None:
        settings.temperature = temperature
    
    session.commit()
    session.refresh(settings)
    return settings

# User Credits endpoints
@router.get("/credits", response_model=UserCredits)
def get_user_credits(current_user: CurrentUser, session: SessionDep) -> Any:
    """
    Get credits for the current user.
    """
    statement = select(UserCredits).where(UserCredits.user_id == current_user.id)
    credits = session.exec(statement).first()
    
    if not credits:
        # Create default credits if none exist
        credits = UserCredits(user_id=current_user.id)
        session.add(credits)
        session.commit()
        session.refresh(credits)
    
    return credits

@router.patch("/credits", response_model=UserCredits)
def update_user_credits(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    credits: int = None
) -> Any:
    """
    Update credits for the current user.
    """
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    statement = select(UserCredits).where(UserCredits.user_id == current_user.id)
    user_credits = session.exec(statement).first()
    
    if not user_credits:
        user_credits = UserCredits(user_id=current_user.id)
        session.add(user_credits)
    
    if credits is not None:
        user_credits.credits = credits
        user_credits.last_updated = datetime.now()
    
    session.commit()
    session.refresh(user_credits)
    return user_credits

# Admin endpoints - only for superusers
@router.patch("/credits/{user_id}", response_model=UserCredits, dependencies=[Depends(get_current_active_superuser)])
def update_user_credits_admin(
    *,
    session: SessionDep,
    user_id: uuid.UUID,
    credits: int
) -> Any:
    """
    Update credits for any user (admin only).
    """
    statement = select(UserCredits).where(UserCredits.user_id == user_id)
    user_credits = session.exec(statement).first()
    
    if not user_credits:
        user_credits = UserCredits(user_id=user_id, credits=credits)
        session.add(user_credits)
    else:
        user_credits.credits = credits
        user_credits.last_updated = datetime.now()
    
    session.commit()
    session.refresh(user_credits)
    return user_credits
@router.get("/credit-profiles", response_model=List[CreditProfile], dependencies=[Depends(get_current_active_superuser)])
def get_credit_profiles(session: SessionDep) -> Any:
    """
    Get all credit profiles (admin only).
    """
    statement = select(CreditProfile)
    profiles = session.exec(statement).all()
    
    # If no profiles exist, create the defaults
    if not profiles:
        default_profiles = [
            CreditProfile(name="Basic", amount=100, description="Basic tier with limited features"),
            CreditProfile(name="Standard", amount=500, description="Standard tier with most features"),
            CreditProfile(name="Premium", amount=1000, description="Premium tier with all features")
        ]
        for profile in default_profiles:
            session.add(profile)
        session.commit()
        profiles = default_profiles
    
    return profiles

@router.patch("/credit-profiles/{profile_id}", response_model=CreditProfile, dependencies=[Depends(get_current_active_superuser)])
def update_credit_profile(
    *,
    session: SessionDep,
    profile_id: uuid.UUID,
    amount: int,
    description: str = None
) -> Any:
    """
    Update a credit profile (admin only).
    """
    profile = session.get(CreditProfile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Credit profile not found")
    
    profile.amount = amount
    if description is not None:
        profile.description = description
    profile.updated_at = datetime.now()
    
    session.add(profile)
    session.commit()
    session.refresh(profile)
    return profile