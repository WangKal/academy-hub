# Academy Hub — Python FastAPI Backend Architecture Specification

This blueprint details the Python backend architecture for refactoring the Academy Hub LMS services to Python (FastAPI / Django REST Framework) while maintaining 100% compatibility with the frontend domain type contracts in `src/types/index.ts`.

---

## 1. Project Directory Structure (FastAPI)

```
backend-python/
├── app/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.py
│   │   │   │   ├── courses.py
│   │   │   │   ├── enrollments.py
│   │   │   │   ├── payments.py
│   │   │   │   ├── certificates.py
│   │   │   │   ├── admin_rbac.py
│   │   │   │   ├── organizations.py
│   │   │   │   └── audit_logs.py
│   │   │   └── api.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py          # JWT authentication & password hashing
│   │   └── rbac.py              # Multi-Admin sub-role & permission dependency guards
│   ├── db/
│   │   ├── base.py
│   │   └── session.py           # SQLAlchemy async session manager
│   ├── models/                  # SQLAlchemy ORM Models
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── organization.py
│   │   └── audit.py
│   ├── schemas/                 # Pydantic DTOs matching src/types/index.ts
│   │   ├── user.py
│   │   ├── course.py
│   │   ├── organization.py
│   │   └── rbac.py
│   ├── services/                # Business logic
│   └── main.py                  # FastAPI Application Entrypoint
├── alembic/                      # Database migrations
├── pyproject.toml
└── README.md
```

---

## 2. API Contract Mapping Table

The table below maps the frontend `src/services/api.ts` & `src/services/apiAdapter.ts` contracts to Python FastAPI endpoints:

| Domain Area     | Frontend Method           | FastAPI Endpoint               | HTTP Method | Auth & RBAC Requirement                     |
| :-------------- | :------------------------ | :----------------------------- | :---------- | :------------------------------------------ |
| **Auth**        | `login(input)`            | `/api/v1/auth/login`           | `POST`      | Public                                      |
| **Auth**        | `register(input)`         | `/api/v1/auth/register`        | `POST`      | Public                                      |
| **Courses**     | `getCourses(filters)`     | `/api/v1/courses`              | `GET`       | Public / Auth                               |
| **Courses**     | `getCourseDetail(slug)`   | `/api/v1/courses/{slug}`       | `GET`       | Public / Auth                               |
| **Admin RBAC**  | `getAdminTeam()`          | `/api/v1/admin/team`           | `GET`       | `RequirePermission("manage_admins")`        |
| **Admin RBAC**  | `assignAdminSubRole(...)` | `/api/v1/admin/subrole`        | `PUT`       | `RequirePermission("manage_admins")`        |
| **B2B Orgs**    | `getOrganizations()`      | `/api/v1/organizations`        | `GET`       | `RequirePermission("manage_organizations")` |
| **B2B Orgs**    | `createOrganization(...)` | `/api/v1/organizations`        | `POST`      | `RequirePermission("manage_organizations")` |
| **Bulk Enroll** | `bulkEnrollStudents(...)` | `/api/v1/students/bulk-enroll` | `POST`      | `RequirePermission("manage_users")`         |
| **Audit Logs**  | `getAuditLogs(filters)`   | `/api/v1/admin/audit-logs`     | `GET`       | `RequirePermission("view_audit_logs")`      |

---

## 3. Sample Pydantic Schemas (Parity with Frontend DTOs)

### Multi-Admin RBAC Schema (`app/schemas/rbac.py`)

```python
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from enum import Enum

class AdminSubRole(str, Enum):
    super_admin = "super_admin"
    academic_admin = "academic_admin"
    finance_admin = "finance_admin"
    user_admin = "user_admin"
    compliance_admin = "compliance_admin"

class AdminPermissionRecord(BaseModel):
    id: str
    userId: str
    userName: Optional[str] = None
    userEmail: Optional[str] = None
    subRole: AdminSubRole
    permissions: List[str]
    grantedBy: Optional[str] = None
    createdAt: str
    updatedAt: str
```

### Organization Schema (`app/schemas/organization.py`)

```python
from pydantic import BaseModel, EmailStr
from typing import Optional

class OrganizationCreate(BaseModel):
    name: str
    code: str
    contactEmail: EmailStr
    domain: Optional[str] = None
    maxSeats: int = 100

class OrganizationResponse(OrganizationCreate):
    id: str
    activeSeats: int = 0
    createdAt: str
    updatedAt: str
```

---

## 4. FastAPI Dependency Permission Guard (`app/core/rbac.py`)

```python
from fastapi import Depends, HTTPException, status
from app.core.security import get_current_user
from app.schemas.user import UserDTO

def require_permission(required_permission: str):
    async def permission_checker(current_user: UserDTO = Depends(get_current_user)):
        if current_user.role != "admin":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin role required")

        # Check sub-role / permissions logic
        if "super_admin" in current_user.permissions or required_permission in current_user.permissions:
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission '{required_permission}' required"
        )
    return permission_checker
```

---

## 5. Migration Execution Checklist

1. Set up FastAPI project dependencies: `fastapi`, `uvicorn`, `sqlalchemy`, `alembic`, `pydantic`, `pyjwt`, `psycopg2-binary`.
2. Generate PostgreSQL schema using Alembic matching `supabase/migrations/`.
3. Set environment variable `VITE_API_PROVIDER="python"` in `.env`.
4. Point `VITE_PYTHON_API_URL` to FastAPI backend (`http://localhost:8000/api/v1`).
