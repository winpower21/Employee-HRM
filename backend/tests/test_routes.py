from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models.user import User, UserRole

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

_admin_token = None
_created_emp_id = None
_created_dept_id = None
_created_pos_id = None


def get_admin_headers():
    """Register an admin user (once), promote via DB, login, cache token."""
    global _admin_token
    if _admin_token:
        return {"Authorization": f"Bearer {_admin_token}"}

    client.post(
        "/users/register",
        json={
            "name": "Admin User",
            "email": "admin@example.com",
            "password": "adminpassword123",
        },
    )

    db = TestingSessionLocal()
    user = db.query(User).filter(User.email == "admin@example.com").first()
    user.role = UserRole.admin
    db.commit()
    db.close()

    response = client.post(
        "/auth/login",
        data={
            "username": "admin@example.com",
            "password": "adminpassword123",
        },
    )
    _admin_token = response.json()["token"]["access_token"]
    return {"Authorization": f"Bearer {_admin_token}"}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


def test_register_user():
    response = client.post(
        "/users/register",
        json={
            "name": "Test User",
            "email": "test@example.com",
            "password": "testpassword123",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["name"] == "Test User"
    assert "id" in data


def test_login_user():
    response = client.post(
        "/auth/login",
        data={
            "username": "test@example.com",
            "password": "testpassword123",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "access_token" in data["token"]
    assert data["token"]["token_type"] == "bearer"


def test_login_invalid_credentials():
    response = client.post(
        "/auth/login",
        data={
            "username": "test@example.com",
            "password": "wrongpassword",
        },
    )
    assert response.status_code == 403


# ---------------------------------------------------------------------------
# Departments
# ---------------------------------------------------------------------------


def test_create_department():
    global _created_dept_id
    response = client.post(
        "/department/new",
        json={"name": "Engineering", "description": "Software engineering team"},
        headers=get_admin_headers(),
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Engineering"
    assert data["description"] == "Software engineering team"
    assert "id" in data
    _created_dept_id = data["id"]


def test_get_all_departments():
    response = client.get("/department/all", headers=get_admin_headers())
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == "Engineering"


# ---------------------------------------------------------------------------
# Positions
# ---------------------------------------------------------------------------


def test_create_position():
    global _created_pos_id
    response = client.post(
        "/position/new",
        json={"name": "Software Engineer", "description": "Develops software products"},
        headers=get_admin_headers(),
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Software Engineer"
    assert "id" in data
    _created_pos_id = data["id"]


def test_get_all_positions():
    response = client.get("/position/all", headers=get_admin_headers())
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert data[0]["name"] == "Software Engineer"


# ---------------------------------------------------------------------------
# Employees
# ---------------------------------------------------------------------------


def test_get_all_employees_empty():
    """Employees table is empty at this point in the test run."""
    response = client.get("/employees/all", headers=get_admin_headers())
    assert response.status_code == 404


def test_create_employee():
    global _created_emp_id, _created_dept_id, _created_pos_id
    response = client.post(
        "/employees/new",
        json={
            "first_name": "John",
            "middle_name": None,
            "last_name": "Doe",
            "dob": "1990-01-15",
            "email": "john.doe@example.com",
            "phone": "1234567890",
            "salary": 60000,
            "department_id": _created_dept_id,
            "position_id": _created_pos_id,
            "hire_date": "2024-01-01",
        },
        headers=get_admin_headers(),
    )
    print(response.json())
    assert response.status_code == 201
    data = response.json()
    assert data["first_name"] == "John"
    assert data["last_name"] == "Doe"
    assert data["email"] == "john.doe@example.com"
    _created_emp_id = data["emp_id"]


def test_get_employee_by_id():
    response = client.get(f"/employees/{_created_emp_id}", headers=get_admin_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["emp_id"] == _created_emp_id
    assert data["first_name"] == "John"


def test_get_employee_not_found():
    response = client.get("/employees/nonexistent-id-000", headers=get_admin_headers())
    assert response.status_code == 404
