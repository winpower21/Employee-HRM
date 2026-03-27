from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core import get_current_user, require_admin
from app.database import get_db
from app.exceptions import (
    DatabaseException,
    DataIntegrityException,
    NoResultFoundException,
)
from app.schema import PositionCreate, PositionSchema
from app.services import PositionService

router = APIRouter(
    prefix="/position",
    tags=["positions"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/all", response_model=list[PositionSchema], status_code=status.HTTP_200_OK)
def get_all_positions(db: Session = Depends(get_db)):
    position_service = PositionService(db)
    positions = position_service.get_positions()
    return positions


@router.get("/{id}", response_model=PositionSchema, status_code=status.HTTP_200_OK)
def get_position_by_id(db: Session = Depends(get_db)):
    position_service = PositionService(db)
    try:
        position = position_service.get_positon_by_id(id)
        return position
    except NoResultFoundException as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)


@router.post(
    "/new",
    response_model=PositionSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def create_position(data: PositionCreate, db: Session = Depends(get_db)):
    position_service = PositionService(db)
    try:
        position = position_service.create_position(data)
        return position
    except DataIntegrityException as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=e.message)
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )


@router.put(
    "/update/{id}",
    response_model=PositionSchema,
    status_code=status.HTTP_200_OK,
    dependencies=[Depends(require_admin)],
)
def update_position(id: int, data: PositionCreate, db: Session = Depends(get_db)):
    position_service = PositionService(db)
    try:
        position = position_service.update_position(id, data)
        return position
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
def delete_position(id: int, db: Session = Depends(get_db)):
    position_service = PositionService(db)
    try:
        position_service.delete_position(id)
        return
    except DatabaseException as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=e.message
        )
