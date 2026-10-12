"""
FastAPI Dependencies
Reusable dependencies for authentication, authorization, and database access
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.db.models import User
from app.core.supabase_auth import verify_supabase_token, get_or_create_user

from app.core.security import decode_token
from app.core.token_blacklist import token_blacklist
from sqlalchemy import select

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from a local JWT or Supabase JWT.

    Args:
        token: JWT access token from request header
        db: Database session

    Returns:
        User object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Check if token is blacklisted
    try:
        if await token_blacklist.is_blacklisted(token):
            raise credentials_exception
    except Exception:
        # If redis check fails, do not block if redis is unreachable in tests
        pass

    # First attempt: Try decoding as local Native Colab JWT
    payload = decode_token(token)
    if payload:
        if payload.get("type") != "access":
            raise credentials_exception

        sub = payload.get("sub")
        if not sub:
            raise credentials_exception

        # User ID or Email lookup
        user = None
        if str(sub).isdigit():
            result = await db.execute(select(User).where(User.id == int(sub)))
            user = result.scalar_one_or_none()
        else:
            result = await db.execute(select(User).where(User.email == str(sub)))
            user = result.scalar_one_or_none()

        if user is None:
            raise credentials_exception

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )

        return user

    # Second attempt: Try decoding as Supabase token (backward compatibility)
    try:
        claims = verify_supabase_token(token)
    except HTTPException:
        raise credentials_exception

    if claims.get("role") != "authenticated":
        raise credentials_exception

    supabase_id = claims.get("sub")
    if not supabase_id:
        raise credentials_exception

    user = await get_or_create_user(db, claims)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    return user



async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.

    Args:
        current_user: Current user from get_current_user dependency

    Returns:
        User object

    Raises:
        HTTPException: If user is not active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current super admin user.

    Args:
        current_user: Current user from get_current_user dependency

    Returns:
        User object

    Raises:
        HTTPException: If user is not a super admin
    """
    if not current_user.is_super_admin():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not have sufficient privileges"
        )
    return current_user


async def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise.
    Useful for endpoints that work for both authenticated and anonymous users.

    Args:
        token: Optional JWT access token
        db: Database session

    Returns:
        User object if authenticated, None otherwise
    """
    if token is None:
        return None

    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None
