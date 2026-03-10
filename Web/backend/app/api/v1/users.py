"""
用户 API
"""

from fastapi import APIRouter, HTTPException, status

from app.db.supabase import get_supabase_client
from app.models.user import User, UserUpdate
from app.core.deps import CurrentUser, Admin

router = APIRouter()


@router.get("/me", response_model=User)
async def get_current_user_info(user: CurrentUser):
    """获取当前用户信息"""
    return user


@router.patch("/me", response_model=User)
async def update_current_user(update: UserUpdate, user: CurrentUser):
    """更新当前用户信息"""
    supabase = get_supabase_client()
    
    data = update.model_dump(exclude_unset=True)
    result = supabase.table("profiles").update(data).eq("id", user.id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(
        id=user.id,
        email=user.email,
        **result.data[0]
    )


@router.get("/{user_id}", response_model=User)
async def get_user(user_id: str, current_user: CurrentUser):
    """获取用户信息 (公开资料)"""
    supabase = get_supabase_client()
    
    result = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return result.data


@router.patch("/{user_id}/role")
async def update_user_role(user_id: str, role: str, admin: Admin):
    """更新用户角色 (管理员)"""
    if role not in ("student", "teacher", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    
    supabase = get_supabase_client()
    
    result = supabase.table("profiles").update({"role": role}).eq("id", user_id).execute()
    
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User role updated to {role}"}
