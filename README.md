# School Management System (SMS)

A full-stack School Management System built with **Laravel** (API backend) and **React** (SPA frontend).

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Laravel 12 | REST API, business logic, authentication |
| **Auth** | Laravel Sanctum | Token-based API authentication |
| **Database** | SQLite (dev) / MySQL or PostgreSQL (prod) | Data persistence |
| **Frontend** | React 19 + TypeScript | Single-page application |
| **Build Tool** | Vite | Fast dev server and production builds |
| **Routing** | React Router v7 | Client-side navigation |
| **State** | Zustand | Auth state management |
| **Data Fetching** | TanStack React Query | Server state, caching, refetching |
| **HTTP Client** | Axios | API requests |
| **Charts** | Recharts | Interactive analytics and graphs |
| **Icons** | Lucide React | Modern icon system |

### Recommended Production Additions

- **MySQL/PostgreSQL** — production database
- **Redis** — caching and queues
- **Tailwind CSS** or **shadcn/ui** — polished UI components
- **Laravel Horizon** — queue monitoring
- **Docker** — containerized deployment

---

## Project Structure

```
sms/
├── backend/          # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Http/Middleware/
│   ├── database/migrations/
│   └── routes/api.php
├── frontend/         # React SPA
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── store/
│       └── lib/
└── README.md
```

---

## Development Phases

### Phase 1 — Foundation (Current)
- [x] Laravel API scaffolding with Sanctum auth
- [x] Database schema (users, roles, students, teachers, classes, subjects, enrollments, attendance, grades)
- [x] Core API endpoints (auth, dashboard, CRUD for students/teachers/classes/subjects)
- [x] React frontend with login, dashboard, and list views
- [x] Role-based access control (admin, teacher, student, parent)
- [x] Seed data for development

### Phase 2 — Academic Operations
- [x] Enrollment management (assign students to classes)
- [x] Attendance recording and reports
- [x] Grade/result entry and report cards
- [x] Timetable scheduling
- [x] Teacher portal (class-specific views)
- [x] Student portal (dashboard, timetable, grades view)

### Phase 3 — Administration
- [x] Academic year management UI
- [x] Fee management and payment tracking
- [x] Announcements and notifications
- [x] Document uploads (certificates, ID cards)
- [x] Audit logs
- [x] Modern UI redesign with charts and analytics dashboards

### Phase 4 — Parent & Student Portals
- [x] Parent dashboard (child attendance, grades, fees)
- [x] Student self-service (timetable, results)
- [x] Email/SMS notifications (in-app + email + SMS logging)
- [x] Mobile-responsive design (hamburger menu, bottom nav, responsive charts)

### Phase 5 — Advanced Features
- [x] Library management
- [x] Transport management
- [x] Hostel management
- [x] Analytics and reporting dashboards
- [x] Multi-school support

---

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env   # if needed
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

API runs at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at `http://localhost:5173`

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.local | password |
| Principal | principal@school.local | password |
| Accountant | accountant@school.local | password |
| Teacher | teacher@school.local | password |
| Student | student@school.local | password |
| Parent | parent@school.local | password |

### Role Permissions

| Role | Key capabilities |
|------|------------------|
| **Admin** | Full system access (students, fees, library, transport, reports, etc.) |
| **Principal** | Manage teachers, assign class teachers, build timetables |
| **Accountant** | Collect fees, record payments, view revenue summaries |
| **Teacher** | Attendance, grades, class portal |
| **Student** | View own records and timetable |
| **Parent** | View children's attendance, grades, and fees |

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/login` | Login | Public |
| POST | `/api/logout` | Logout | Sanctum |
| GET | `/api/me` | Current user | Sanctum |
| GET | `/api/dashboard/stats` | Dashboard stats | Sanctum |
| CRUD | `/api/students` | Student management | Admin |
| CRUD | `/api/teachers` | Teacher management | Admin |
| CRUD | `/api/classes` | Class sections | Admin |
| CRUD | `/api/subjects` | Subjects | Admin |
| CRUD | `/api/enrollments` | Student enrollments | Admin |
| GET/POST | `/api/attendance/*` | Mark attendance & reports | Admin, Teacher |
| GET/POST | `/api/grades` | Grade entry & report cards | Admin, Teacher |
| CRUD | `/api/timetables` | Class timetables | Admin |
| GET | `/api/teacher/*` | Teacher portal | Teacher |
| GET | `/api/student/*` | Student portal | Student |
| GET | `/api/parent/*` | Parent portal | Parent |
| GET | `/api/notifications` | Notifications (in-app, email, SMS) | All roles |

---

## Database Schema

```
roles ──< users ──< teachers
              └──< students ──< enrollments >── class_sections
              │              ├──< attendances
              │              └──< grades >── subjects
              └── (class_teacher on class_sections)

academic_years ──< class_sections ──< timetables
              └──< enrollments, grades
```

---

## Branch Strategy

- `main` — stable production-ready code
- `dev` — active development branch

---

## License

MIT
