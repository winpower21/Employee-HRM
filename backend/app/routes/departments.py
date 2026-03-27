from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import get_current_user, require_admin
from app.database import get_db
from app.exceptions import DatabaseException, NoResultFoundException
from app.exceptions.exceptions import DataIntegrityException
from app.schema import DepartmentCreate, DepartmentSchema
from app.services import DepartmentService

router = APIRouter(
    prefix="/department",
    tags=["departments"],
    dependencies=[Depends(get_current_user)],
)


@router.get(
    "/all", response_model=list[DepartmentSchema], status_code=status.HTTP_200_OK
)
def get_all_departments(db: Session = Depends(get_db)):
    department_service = DepartmentService(db)
    departments = department_service.get_departments()
    return departments


@router.get("/{id}", response_model=DepartmentSchema, status_code=status.HTTP_200_OK)
def get_department_by_id(db: Session = Depends(get_db)):
    department_service = DepartmentService(db)
    try:
        department = department_service.get_department_by_id(id)
        return department
    except NoResultFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.post(
    "/new",
    response_model=DepartmentSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_department(data: DepartmentCreate, db: Session = Depends(get_db)):
    department_service = DepartmentService(db)
    try:
        department = department_service.create_department(data)
        return department
    except DataIntegrityException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )


@router.put(
    "/update/{id}",
    response_model=DepartmentSchema,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
def update_department(id: int, data: DepartmentCreate, db: Session = Depends(get_db)):
    department_service = DepartmentService(db)
    try:
        department = department_service.update_department(id, data)
        return department
    except DataIntegrityException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )


@router.delete(
    "/delete/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def delete_department(id: int, db: Session = Depends(get_db)):
    department_service = DepartmentService(db)
    try:
        department_service.delete_department(id)
        return
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )
