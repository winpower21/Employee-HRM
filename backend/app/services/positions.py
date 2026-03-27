from typing import List, Optional

from sqlalchemy.exc import NoResultFound, SQLAlchemyError
from sqlalchemy.orm import Session

from app.exceptions import (
    DataIntegrityException,
    DatabaseException,
    NoResultFoundException,
)
from app.models import Position
from app.schema import PositionCreate


class PositionService:
    def __init__(self, db: Session):
        self.db = db

    def _unique_columns(self):
        return {col.name for col in Position.__table__.columns if col.unique}

    def _check_unique(self, data: dict, exclude_id=None):
        for field in self._unique_columns():
            if field not in data:
                continue
            query = self.db.query(Position).filter(
                getattr(Position, field) == data[field]
            )
            if exclude_id is not None:
                query = query.filter(Position.id != exclude_id)
            if query.first():
                raise DataIntegrityException(
                    f"Position with {field} '{data[field]}' already exists."
                )

    def get_positions(self) -> Optional[List[Position]]:
        return self.db.query(Position).all()

    def get_positon_by_id(self, id) -> Optional[Position]:
        try:
            return self.db.query(Position).filter(Position.id == id).one()
        except NoResultFound:
            raise NoResultFoundException(f"Position with id: {id} not found.")

    def create_position(self, data: PositionCreate) -> Position:
        self._check_unique(data.model_dump())
        try:
            position = Position(name=data.name, description=data.description)
            self.db.add(position)
            self.db.commit()
            self.db.refresh(position)
            return position
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error creating new position")

    def delete_position(self, id):
        position = self.get_positon_by_id(id)
        try:
            self.db.delete(position)
            self.db.commit()
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error deleting position")

    def update_position(self, id, data: PositionCreate) -> Position:
        position = self.get_positon_by_id(id)
        new_data = data.model_dump(exclude_unset=True)
        self._check_unique(new_data, exclude_id=id)
        try:
            for field, value in new_data.items():
                setattr(position, field, value)
            self.db.commit()
            self.db.refresh(position)
            return position
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error updating position")
