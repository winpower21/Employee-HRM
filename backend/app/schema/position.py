from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from .employee import EmployeeSchema


class PositionBase(BaseModel):
    name: str
    description: str


class PositionCreate(PositionBase):
    pass


class PositionSchema(PositionBase):
    id: int
    employees: Optional[List[EmployeeSchema]]

    model_config = ConfigDict(from_attributes=True)
