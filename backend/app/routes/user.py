from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import require_admin
from app.database import get_db
from app.exceptions import DatabaseException, NoResultFoundException, UserAlreadyExistsException
from app.schema import UserCreate, UserRoleUpdate, UserSchema
from app.services import UserService

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.post(
    "/register", response_model=UserSchema, status_code=status.HTTP_201_CREATED
)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    try:
        return user_service.create_user(user)
    except UserAlreadyExistsException as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get(
    "/all",
    response_model=list[UserSchema],
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
def get_all_users(db: Session = Depends(get_db)):
    user_service = UserService(db)
    return user_service.get_all_users()


@router.patch(
    "/{id}/role",
    response_model=UserSchema,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
def update_user_role(id: int, data: UserRoleUpdate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    try:
        return user_service.update_user_role(id, data.role)
    except NoResultFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e)
        )
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
