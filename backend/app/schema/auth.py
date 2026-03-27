from typing import Optional

from pydantic import BaseModel

from .user import UserSchema


class TokenSchema(BaseModel):
    access_token: str
    token_type: str


class LoginResponse(BaseModel):
    token: TokenSchema
    user: UserSchema


class TokenData(BaseModel):
    user_id: Optional[int] = None
