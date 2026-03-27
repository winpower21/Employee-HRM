from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class EmployeeBase(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    dob: date
    email: EmailStr
    phone: str


class EmployeeCreate(EmployeeBase):
    salary: int
    department_id: int
    position_id: int
    hire_date: Optional[date] = None


class EmployeeUpdate(EmployeeBase):
    pass


class EmployeePropUpdate(BaseModel):
    salary: Optional[int] = None
    department_id: Optional[int] = None
    position_id: Optional[int] = None


class DepartmentInfo(BaseModel):
    id: int
    name: str
    description: str
    model_config = ConfigDict(from_attributes=True)


class PositionInfo(BaseModel):
    id: int
    name: str
    description: str
    model_config = ConfigDict(from_attributes=True)


class EmployeeSchema(EmployeeBase):
    emp_id: str
    salary: int
    hire_date: date
    department: "DepartmentInfo"
    position: "PositionInfo"

    model_config = ConfigDict(from_attributes=True)
