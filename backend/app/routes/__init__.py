from .auth import router as auth_router
from .departments import router as deptartment_router
from .employees import router as employee_router
from .positions import router as position_router
from .user import router as user_router

__all__ = [
    "auth_router",
    "user_router",
    "deptartment_router",
    "position_router",
    "employee_router",
]
