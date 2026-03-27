from typing import List, Optional

from sqlalchemy.exc import NoResultFound, SQLAlchemyError
from sqlalchemy.orm import Session

from app.exceptions import (
    DataIntegrityException,
    DatabaseException,
    NoResultFoundException,
)
from app.models import Department
from app.schema import DepartmentCreate


class DepartmentService:
    def __init__(self, db: Session):
        self.db = db

    def _unique_columns(self):
        return {col.name for col in Department.__table__.columns if col.unique}

    def _check_unique(self, data: dict, exclude_id=None):
        for field in self._unique_columns():
            if field not in data:
                continue
            query = self.db.query(Department).filter(
                getattr(Department, field) == data[field]
            )
            if exclude_id is not None:
                query = query.filter(Department.id != exclude_id)
            if query.first():
                raise DataIntegrityException(
                    f"Department with {field} '{data[field]}' already exists."
                )

    def get_departments(self) -> Optional[List[Department]]:
        return self.db.query(Department).all()

    def get_department_by_id(self, id) -> Optional[Department]:
        try:
            return self.db.query(Department).filter(Department.id == id).one()
        except NoResultFound:
            raise NoResultFoundException(f"Department with id: {id} not found.")

    def create_department(self, data: DepartmentCreate) -> Department:
        self._check_unique(data.model_dump())
        try:
            department = Department(name=data.name, description=data.description)
            self.db.add(department)
            self.db.commit()
            self.db.refresh(department)
            return department
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error creating new department")

    def delete_department(self, id):
        department = self.get_department_by_id(id)
        try:
            self.db.delete(department)
            self.db.commit()
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error deleting department")

    def update_department(self, id, data: DepartmentCreate) -> Department:
        department = self.get_department_by_id(id)
        new_data = data.model_dump(exclude_unset=True)
        self._check_unique(new_data, exclude_id=id)
        try:
            for field, value in new_data.items():
                setattr(department, field, value)
            self.db.commit()
            self.db.refresh(department)
            return department
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error updating department")
