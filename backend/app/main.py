from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import (
    auth_router,
    deptartment_router,
    employee_router,
    position_router,
    user_router,
)

from .database import Base, engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")

    # Create tables
    Base.metadata.create_all(bind=engine)

    yield

    print("Shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route registration
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(employee_router)
app.include_router(deptartment_router)
app.include_router(position_router)


# Root endpoint
@app.get("/")
def read_root():
    """Root endpoint - API health check."""
    return {
        "message": "Welcome to FastAPI Backend",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "docs": "/api/docs",
    }


# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.ENVIRONMENT == "development",
    )
