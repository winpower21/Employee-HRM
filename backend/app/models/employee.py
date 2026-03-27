from datetime import date

from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from typing_extensions import TYPE_CHECKING

from ..database import Base

if TYPE_CHECKING:
    from .department import Department
    from .position import Position


class Employee(Base):
    __tablename__ = "employees"
    emp_id: Mapped[str] = mapped_column(String(36), primary_key=True)
    first_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    middle_name: Mapped[str] = mapped_column(String(50), nullable=True, index=True)
    last_name: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    dob: Mapped[date] = mapped_column(Date)
    email: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True, unique=True
    )
    phone: Mapped[str] = mapped_column(
        String(50), nullable=False, index=True, unique=True
    )
    hire_date: Mapped[date] = mapped_column(Date, server_default=func.current_date())
    salary: Mapped[int] = mapped_column(Integer, nullable=False)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    position_id: Mapped[int] = mapped_column(ForeignKey("positions.id"))

    department: Mapped[Department] = relationship(
        "Department", back_populates="employees"
    )

    position: Mapped[Position] = relationship("Position", back_populates="employees")
