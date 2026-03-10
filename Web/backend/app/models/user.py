"""
用户模型
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """用户基础模型"""
    username: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    grade: Optional[str] = None
    class_name: Optional[str] = None
    student_id: Optional[str] = None


class User(UserBase):
    """用户完整模型"""
    id: str
    email: Optional[EmailStr] = None
    role: str = "student"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class UserCreate(UserBase):
    """创建用户"""
    email: EmailStr
    password: str


class UserUpdate(UserBase):
    """更新用户"""
    pass


class UserInDB(User):
    """数据库用户模型"""
    pass
