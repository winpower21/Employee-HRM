from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import get_current_user, require_admin
from app.database import get_db
from app.exceptions import (
    DatabaseException,
    DataIntegrityException,
    NoResultFoundException,
    NotFoundException,
)
from app.schema import (
    EmployeeCreate,
    EmployeePropUpdate,
    EmployeeSchema,
    EmployeeUpdate,
)
from app.services import EmployeeService

router = APIRouter(
    prefix="/employees",
    tags=["employees"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/all", response_model=list[EmployeeSchema], status_code=status.HTTP_200_OK)
def get_all_employees(db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    employees = employee_service.get_employees()
    if not employees:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No employees found"
        )
    return employees


@router.get("/{id}", response_model=EmployeeSchema, status_code=status.HTTP_200_OK)
def get_employee_by_id(id: str, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    try:
        employee = employee_service.get_employee_by_id(id)
        return employee
    except NoResultFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=str(e.message)
        )


@router.get(
    "/{email}", response_model=list[EmployeeSchema], status_code=status.HTTP_200_OK
)
def search_employee_by_email(email: str, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    employees = employee_service.search_employee_by_email(email)
    if not employees:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No results found"
        )
    return employees


@router.get(
    "/{name}", response_model=list[EmployeeSchema], status_code=status.HTTP_200_OK
)
def search_employee_by_name(name: str, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    employees = employee_service.search_employee_by_name(name)
    if not employees:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No results found"
        )
    return employees


@router.post(
    "/new",
    response_model=EmployeeSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def new_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    try:
        new_emp = employee_service.create_employee(data)
        return new_emp
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=e.message
        )
    except DataIntegrityException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )


@router.put(
    "/update/{id}",
    response_model=EmployeeSchema,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
def update_employee(id: str, data: EmployeeUpdate, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    try:
        updated_employee = employee_service.update_employee(id, data)
        return updated_employee
    except DataIntegrityException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )


@router.patch(
    "/update/{id}",
    response_model=EmployeeSchema,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
def update_employee_props(
    id: str, data: EmployeePropUpdate, db: Session = Depends(get_db)
):
    employee_service = EmployeeService(db)
    try:
        updated_employee = employee_service.update_employee_props(id, data)
        return updated_employee
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=e.message
        )
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )


@router.delete(
    "/delete/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_employee(id: str, db: Session = Depends(get_db)):
    employee_service = EmployeeService(db)
    try:
        employee_service.delete_employee(id)
        return
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )
