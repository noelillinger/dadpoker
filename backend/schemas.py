from pydantic import BaseModel, ConfigDict
from typing import Optional, List


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    username: str
    role: str
    is_active: bool
    must_change_password: bool
    balance: int


class MeOut(UserOut):
    pass


class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class CreateUserRequest(BaseModel):
    username: str
    temp_password: str
    role: str


class UpdateUserRequest(BaseModel):
    is_active: Optional[bool] = None
    temp_password: Optional[str] = None
    must_change_password: Optional[bool] = None
    role: Optional[str] = None


class UserListResponse(BaseModel):
    users: List[UserOut]


class HealthResponse(BaseModel):
    status: str


class UserSettingsRequest(BaseModel):
    auto_rebuy: Optional[bool] = None


class UserSettingsResponse(BaseModel):
    auto_rebuy: bool


class UserProfileResponse(BaseModel):
    balance: int
    auto_rebuy: bool


class HandItem(BaseModel):
    id: int
    ts: str
    delta: int
    difficulty: str
    players: int


class HistoryResponse(BaseModel):
    items: List[HandItem]


