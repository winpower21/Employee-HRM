# About
This is a Employee HRM platform built using:
- Backend: FastAPI, Python
- Database: PostgreSQL
- Frontend: React

# Prerequisites
- Docker
- Docker Compose
- git

# Instructions
Clone the repository:
`git clone https://github.com/winpower21/Employee-HRM.git`

Start the app in docker:
`docker compose up`

# Design Decisions
The core technologies (React, FastAPI, PostgreSQL) were predefined. 
The following design decisions focus on how the system was structured, organized, and implemented on top of these technologies.

### Project Structure
I structured the backend using a modular approach with separate folders for:
- routes (API layer)
- services (business logic)
- models (database schema)
- schemas (data validation)
- core (auth functions and dependencies)
- exceptions (custom exceptions)
This improves maintainability and makes the codebase easier to scale.

### Service Layer Design
I implemented a service layer (e.g., EmployeeService) to handle business logic separately from API routes.
This ensures:
- Thin and readable route handlers
- Reusable logic
- Easier testing and debugging


### Authentication and Authorization
JWT-based authentication is used to secure the API.
Role-based access control is implemented (e.g., admin-only routes) using dependency injection.
This ensures secure and controlled access to resources.
Additional frontend checks for role based access.

### Testing Strategy
I used pytest to test API endpoints.
- FastAPI TestClient is used for request simulation
- Database dependencies are overridden for isolated testing
- SQLite in-memory database is used for fast and safe tests
This ensures tests do not affect production data.


### Containerization
The application is containerized using Docker Compose with three services:
- database
- backend
- frontend
Design decisions:
- Service names are used for internal communication (e.g., "db" instead of localhost)
- Health checks ensure the database is ready before the backend starts
- Environment variables are separated using env files
This setup ensures consistency across development environments.


### API Design
The API follows RESTful principles with clear route structures such as:
- /employees
- /department
- /position
HTTP status codes are used appropriately for success and error handling.


### Error Handling
Custom exception classes are used to handle different error scenarios.
These are converted into HTTP responses at the API layer, ensuring:
- Consistent error responses
- Separation of business logic and HTTP concerns


### Data Integrity
Foreign key relationships are used to enforce constraints between:
- Employees
- Departments
- Positions
Unique constraints are applied on fields like email and phone to prevent duplicate records.
Employee id's generated using uuid.

### Trade-offs
- Used synchronous SQLAlchemy instead of async for simplicity and easier debugging
- Used SQLite for testing instead of PostgreSQL for speed
- Ran frontend in development mode inside Docker for faster iteration instead of production optimization


### Scalability Considerations
The separation of frontend, backend, and database allows independent scaling.
The service layer design also makes it easier to extend business logic without modifying API routes.


## Conclusion
These design decisions were made to ensure a balance between scalability, maintainability, and development efficiency.


# AI Usage
AI was used to improve page styling and understanding React (this is my first react project). All other code was written manually.
