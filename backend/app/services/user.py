from typing import Optional

from sqlalchemy.exc import IntegrityError, NoResultFound
from sqlalchemy.orm import Session

from app.core import get_password_hash, verify_password
from app.exceptions import (
    DatabaseException,
    InvalidCredentialsException,
    NoResultFoundException,
    UserAlreadyExistsException,
)
from app.models import User
from app.models.user import UserRole
from app.schema import UserCreate


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_user(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).one()

    def get_all_users(self) -> list[User]:
        return self.db.query(User).all()

    def create_user(self, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        user_count = self.db.query(User).count()
        role = UserRole.admin if user_count == 0 else UserRole.user
        try:
            db_user = User(
                name=user.name,
                email=user.email,
                password=hashed_password,
                role=role,
            )
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            return db_user
        except IntegrityError:
            self.db.rollback()
            raise UserAlreadyExistsException("User with email already exists")
        except Exception:
            self.db.rollback()
            raise DatabaseException("Database error")

    def update_user_role(self, user_id: int, role: UserRole) -> User:
        try:
            user = self.db.query(User).filter(User.id == user_id).one()
            user.role = role
            self.db.commit()
            self.db.refresh(user)
            return user
        except NoResultFound:
            raise NoResultFoundException(f"User {user_id} not found")
        except Exception:
            self.db.rollback()
            raise DatabaseException("Database error")

    def authenticate_user(self, email: str, password: str) -> Optional[User]:
        try:
            user = self.db.query(User).filter(User.email == email).one()
            if not verify_password(password, user.password):
                raise InvalidCredentialsException("Invalid Credentials")
            return user
        except NoResultFound:
            raise InvalidCredentialsException("Invalid Credentials")
