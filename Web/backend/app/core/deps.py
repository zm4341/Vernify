"""
FastAPI 依赖注入
"""

from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from app.core.config import settings
from app.db.supabase import get_supabase_client
from app.models.user import User

# HTTP Bearer 认证
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[Optional[HTTPAuthorizationCredentials], Depends(security)]
) -> Optional[User]:
    """
    从 JWT Token 获取当前用户
    如果没有 token 或 token 无效，返回 None
    """
    if not credentials:
        return None
    
    token = credentials.credentials
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        # 从 Supabase 获取用户信息
        supabase = get_supabase_client()
        result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
        
        if result.data:
            return User(
                id=user_id,
                email=payload.get("email"),
                role=result.data.get("role", "student"),
                **result.data
            )
        return None
        
    except JWTError:
        return None


async def get_current_user_required(
    user: Annotated[Optional[User], Depends(get_current_user)]
) -> User:
    """
    要求必须登录的依赖
    如果未登录，抛出 401 错误
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_teacher_or_admin(
    user: Annotated[User, Depends(get_current_user_required)]
) -> User:
    """
    要求教师或管理员权限
    """
    if user.role not in ("teacher", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Teacher or admin role required.",
        )
    return user


async def get_admin(
    user: Annotated[User, Depends(get_current_user_required)]
) -> User:
    """
    要求管理员权限
    """
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Admin role required.",
        )
    return user


# 类型别名
CurrentUser = Annotated[User, Depends(get_current_user_required)]
OptionalUser = Annotated[Optional[User], Depends(get_current_user)]
TeacherOrAdmin = Annotated[User, Depends(get_teacher_or_admin)]
Admin = Annotated[User, Depends(get_admin)]
