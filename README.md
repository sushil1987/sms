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
- [ ] Enrollment management (assign students to classes)
- [ ] Attendance recording and reports
- [ ] Grade/result entry and report cards
- [ ] Timetable scheduling
- [ ] Teacher portal (class-specific views)

### Phase 3 — Administration
- [ ] Academic year management UI
- [ ] Fee management and payment tracking
- [ ] Announcements and notifications
- [ ] Document uploads (certificates, ID cards)
- [ ] Audit logs

### Phase 4 — Parent & Student Portals
- [ ] Parent dashboard (child attendance, grades, fees)
- [ ] Student self-service (timetable, results)
- [ ] Email/SMS notifications
- [ ] Mobile-responsive design

### Phase 5 — Advanced Features
- [ ] Library management
- [ ] Transport management
- [ ] Hostel management
- [ ] Analytics and reporting dashboards
- [ ] Multi-school support

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
| Teacher | teacher@school.local | password |
| Student | student@school.local | password |

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

---

## Database Schema

```
roles ──< users ──< teachers
              └──< students ──< enrollments >── class_sections
              │              ├──< attendances
              │              └──< grades >── subjects
              └── (class_teacher on class_sections)

academic_years ──< class_sections
              └──< enrollments, grades
```

---

## Branch Strategy

- `main` — stable production-ready code
- `dev` — active development branch

---

## License

MIT
