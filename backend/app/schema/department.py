from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from .employee import EmployeeSchema


class DepartmentBase(BaseModel):
    name: str
    description: str


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentSchema(DepartmentBase):
    id: int
    employees: Optional[List[EmployeeSchema]]

    model_config = ConfigDict(from_attributes=True)
