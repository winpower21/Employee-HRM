from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.config import settings
from app.core.auth import create_access_token
from app.database import get_db
from app.exceptions import InvalidCredentialsException, NoResultFoundException
from app.schema import LoginResponse
from app.services import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse, status_code=status.HTTP_200_OK)
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Session = Depends(get_db),
):
    user_service = UserService(db)
    try:
        user = user_service.authenticate_user(form_data.username, form_data.password)
        print(form_data.username, form_data.password)
        if user:
            access_token_expires = timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
            access_token = create_access_token(
                data={"user_id": user.id}, expires_delta=access_token_expires
            )
            return {
                "token": {
                    "access_token": access_token,
                    "token_type": "bearer",
                },
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "role": user.role,
                },
            }

    except NoResultFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except InvalidCredentialsException as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Application Error",
            headers={"WWW-Authenticate": "Bearer"},
        )
