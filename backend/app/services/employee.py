import uuid
from typing import List, Optional

from sqlalchemy import or_
from sqlalchemy.exc import NoResultFound, SQLAlchemyError
from sqlalchemy.orm import Session

from app.exceptions import (
    DataIntegrityException,
    DatabaseException,
    NoResultFoundException,
    NotFoundException,
)
from app.models import Department, Employee, Position
from app.schema import (
    EmployeeCreate,
    EmployeePropUpdate,
    EmployeeUpdate,
)


class EmployeeService:
    def __init__(self, db: Session):
        self.db = db

    def _unique_columns(self):
        return {col.name for col in Employee.__table__.columns if col.unique}

    def _check_unique(self, data: dict, exclude_id=None):
        for field in self._unique_columns():
            if field not in data:
                continue
            query = self.db.query(Employee).filter(
                getattr(Employee, field) == data[field]
            )
            if exclude_id is not None:
                query = query.filter(Employee.emp_id != exclude_id)
            if query.first():
                raise DataIntegrityException(
                    f"Employee with {field} '{data[field]}' already exists."
                )

    def get_employees(self):
        return self.db.query(Employee).all()

    def get_employee_by_id(self, id: str) -> Optional[Employee]:
        try:
            return self.db.query(Employee).filter(Employee.emp_id == id).one()
        except NoResultFound:
            raise NoResultFoundException(f"Employee with id: {id} not found")

    def get_employee_by_email(self, email: str) -> Optional[Employee]:
        try:
            employee = self.db.query(Employee).filter(Employee.email == email).first()
            if not employee:
                raise NoResultFound
            return employee
        except NoResultFound:
            raise NoResultFoundException("No employees found with this email.")

    def search_employee_by_email(self, email: str) -> Optional[List[Employee]]:
        employees = (
            self.db.query(Employee).filter(Employee.email.ilike(f"%{email}%")).all()
        )
        return employees

    def search_employee_by_name(self, name: str) -> Optional[List[Employee]]:
        employees = (
            self.db.query(Employee)
            .filter(
                or_(
                    Employee.first_name.ilike(f"%{name}%"),
                    Employee.middle_name.ilike(f"%{name}%"),
                    Employee.last_name.ilike(f"%{name}%"),
                ),
            )
            .all()
        )
        return employees

    def create_employee(self, data: EmployeeCreate) -> Optional[Employee]:
        dept_id = int(data.department_id)
        pos_id = int(data.position_id)

        department = self.db.query(Department).filter(Department.id == dept_id).first()
        position = self.db.query(Position).filter(Position.id == pos_id).first()
        if not department:
            raise NotFoundException(f"Department with id {dept_id} not found.")
        if not position:
            raise NotFoundException(f"Position with id {pos_id} not found.")

        self._check_unique(data.model_dump())

        try:
            new_id = str(uuid.uuid4())
            employee = Employee(
                emp_id=new_id,
                first_name=data.first_name,
                middle_name=data.middle_name,
                last_name=data.last_name,
                phone=data.phone,
                email=data.email,
                dob=data.dob,
                hire_date=data.hire_date,
                salary=data.salary,
                department_id=dept_id,
                position_id=pos_id,
            )
            self.db.add(employee)
            self.db.commit()
            self.db.refresh(employee)
            return employee
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error creating employee")

    def update_employee(self, id, data: EmployeeUpdate) -> Employee:
        employee = self.get_employee_by_id(id)
        updated_data = data.model_dump(exclude_unset=True)
        self._check_unique(updated_data, exclude_id=id)
        try:
            for field, value in updated_data.items():
                setattr(employee, field, value)
            self.db.commit()
            self.db.refresh(employee)
            return employee
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error while updating employee")

    def update_employee_props(self, id, data: EmployeePropUpdate) -> Employee:
        employee = self.get_employee_by_id(id)
        updated_employee = data.model_dump(exclude_unset=True)
        try:
            if "department_id" in updated_employee:
                if (
                    not self.db.query(Department)
                    .filter(Department.id == updated_employee["department_id"])
                    .first()
                ):
                    raise NotFoundException(
                        f"Department with id: {updated_employee['department_id']} does not exist"
                    )
            if "position_id" in updated_employee:
                if (
                    not self.db.query(Position)
                    .filter(Position.id == updated_employee["position_id"])
                    .first()
                ):
                    raise NotFoundException(
                        f"Position with id: {updated_employee['position_id']} does not exist"
                    )
            for field, value in updated_employee.items():
                setattr(employee, field, value)
            self.db.commit()
            self.db.refresh(employee)
            return employee
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException("Error while updating employee properties")

    def delete_employee(self, id):
        employee = self.get_employee_by_id(id)
        try:
            self.db.delete(employee)
            self.db.commit()
        except SQLAlchemyError:
            self.db.rollback()
            raise DatabaseException(f"Could not delete employee with id: {id}")
