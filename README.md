<div align="center">

# CAST

### Citra Academic Support & Ticketing

**Real-time Academic Complaint & Service Request Platform**

[![Laravel](https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Pusher](https://img.shields.io/badge/Pusher-WebSocket-300D4F?style=for-the-badge&logo=pusher&logoColor=white)](https://pusher.com)

CAST is an end-to-end academic support platform that lets students, lecturers, and staff submit complaints, track service requests, and communicate with administrators in real time. Built as an internship deliverable for **PT Citra Konsultama Indonesia** to streamline the institution's academic operations.

</div>

---

## Why CAST?

- Real-time complaint tracking powered by Pusher WebSocket so users and admins stay in sync without refreshing.
- Dual-role system with four user sub-roles (Dosen, Asdos, Staff, Mahasiswa) and a dedicated admin workspace.
- Fair ticketing quota (max 3 claims per day, 15 total) that prevents abuse while keeping submission friction low.
- Purpose-built for academic environments, with fields for class, lab, and room context on every complaint.

---

## Features

### Ticketing System

- Auto-generated ticket identifiers in the format `T000001` (zero-padded, sequential).
- Users can claim up to **3 tickets per day** with a **lifetime cap of 15** active/total tickets.
- Daily quota is refilled automatically at **00:00 WIB** via the Laravel Scheduler (`tickets:reset-daily`, timezone `Asia/Jakarta`).
- Ticket balance endpoint lazily refreshes the daily quota if the user logs in after the reset window.

### Real-time Broadcasting

- Pusher channels:
  - `admin-channel` (public to authenticated admins) for system-wide events.
  - `user.{userId}` (private) for per-user notifications.
  - `admin.{adminId}` (private) for admin-specific events.
- Broadcast events: `ComplaintSubmitted`, `ComplaintStatusChanged`, `ComplaintHidden`, `FeedbackSubmitted`, `FeedbackReplied`, `UserRegistered`, `AssistanceRequestSubmitted`.
- Laravel Echo is wired on the frontend; the backend keeps broadcast dispatch out of controllers through the Observer pattern (`ComplaintObserver`, `FeedbackObserver`, `FeedbackResponseObserver`, `UserObserver`).

### User Management

- Four user sub-roles (Dosen, Asdos, Staff, Mahasiswa) with identical permissions but distinct metadata.
- New registrations receive 3 tickets on day one so they can file a complaint immediately.
- Admins can activate or deactivate accounts; the `CheckUserActive` middleware blocks inactive sessions at the API boundary.

### Complaint Management

- Three priority levels (`low`, `middle`, `high`) and a linear status flow (`waiting` -> `on_progress` -> `done`).
- Every status transition is written to `complaint_status_history` with the admin who made the change, giving a full audit trail.
- Moderation via hide/unhide (`is_hidden`) instead of destructive delete, so nothing is lost and decisions are reversible.
- MySQL FULLTEXT index over `keluhan`, `kelas`, `lab`, and `ruangan` powers a search endpoint used to detect duplicates before submission.

### Feedback and Analytics

- Users submit a 1-5 star rating with free-form feedback.
- Admins reply inline; replies trigger a `FeedbackReplied` notification to the original author.
- The **Analisis Layanan** admin dashboard aggregates ratings and complaint throughput for service-quality review.

### Notification System

- Badge counters driven by `unread-count` endpoints for both user and admin contexts.
- Individual mark-as-read and bulk mark-all-as-read actions.
- Stored in the `notifications` table and mirrored live over Pusher.

### Profile and Security

- Email update: 6-digit verification token sent to the **new** email address (24-hour expiry) to prove ownership before the change is applied.
- Phone update: 6-digit token sent to the **existing** email address so an attacker with phone access alone cannot hijack the account.
- Password change for users requires the current password; admin password change does not, since admins are pre-seeded and managed internally.
- Forgot-password flow supports both self-service (email token) and admin-assisted (request queued to the admin assistance workspace).

### PDF Export

- Client-side PDF generation for complaint reports (bulk or selective) with zero server cost and instant preview.

### Admin Dashboard

The admin workspace surfaces three primary areas plus supporting tools:

- **Kelola Keluhan** - queue, triage, and update complaints; toggle visibility.
- **Kelola Pengguna** - create users, view profiles, activate/deactivate accounts.
- **Analisis Layanan** - aggregated analytics over complaints and feedback.
- Supporting screens: **Bantuan User** (assistance requests), **Profile Settings**, **Dashboard**.

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Laravel 12 | HTTP routing, validation, Eloquent ORM, service container |
| PHP 8.2 | Runtime |
| MySQL | Primary datastore with FULLTEXT search on complaints |
| Laravel Sanctum 4 | API token authentication for users and admins |
| Laravel Broadcasting + `pusher/pusher-php-server` 7 | Server-side event broadcasting |
| Laravel Mail | Transactional email (verification tokens, password resets) |
| Laravel Scheduler | Daily quota reset job |

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI layer |
| Vite 7 | Dev server and build tooling |
| React Router DOM 7 | Client-side routing and protected routes |
| Tailwind CSS 4 (`@tailwindcss/vite`) | Styling |
| Axios | HTTP client |
| Laravel Echo 1.16 + `pusher-js` 8 | Real-time subscriptions |
| Lucide React | Icon set |
| Motion (Framer Motion) | Animations |
| React Fast Marquee | Landing page marquee |
| React Intersection Observer | Scroll-driven reveals |
| React Type Animation | Hero typing effect |

### Architecture Patterns

| Pattern | Usage |
|---------|-------|
| Observer Pattern | Model observers dispatch broadcast events and write history rows |
| Middleware | `CheckUserActive` blocks suspended users at the API layer |
| Context API | Auth state and notification state shared across the React tree |
| Protected Routes | Role-aware route guards on the client |

---

## Architecture

```
+-------------------------------+                +-------------------------------+
|      React + Vite Client      |                |    Laravel 12 API Server      |
|                               |  REST + JSON   |                               |
|  Pages / Components / Context | <------------> |  Controllers / Observers /    |
|  Axios HTTP Client            |  Sanctum Token |  Middleware / Mail / Scheduler|
|                               |                |                               |
+---------------+---------------+                +--------------+----------------+
                |                                                |
                | WebSocket (subscribe)                          | Broadcast (publish)
                |                                                |
                v                                                v
        +-------+------------------------------------------------+------+
        |                       Pusher Channels                         |
        |   admin-channel  |  user.{id} (private)  |  admin.{id}        |
        +---------------------------------------------------------------+
                                        |
                                        | Eloquent ORM
                                        v
                        +---------------+----------------+
                        |         MySQL Database         |
                        |  users, tickets, complaints,   |
                        |  status_history, feedbacks,    |
                        |  notifications, ...            |
                        +--------------------------------+
```

### Key Data Flows

- **Complaint submission** - User sends `POST /api/user/complaints`. `ComplaintObserver::created` broadcasts `ComplaintSubmitted` to `admin-channel` and writes an admin notification row.
- **Status change** - Admin calls `PUT /api/admin/complaints/{id}/status`. `ComplaintObserver::updated` inserts into `complaint_status_history` and broadcasts `ComplaintStatusChanged` on the owning user's private channel.
- **Daily ticket reset** - `Schedule::command('tickets:reset-daily')->dailyAt('00:00')->timezone('Asia/Jakarta')` refills every user's daily quota to 3.
- **Email change** - `POST /api/user/profile/request-email-update` stores a 6-digit token in `email_verifications` and mails it to the **new** address; `POST .../verify-email-update` applies the change.
- **Phone change** - Same token mechanism, but the mail is sent to the user's **existing** email to authorise the change.

---

## Database Schema

Migrations live under `database/migrations/`. Core tables:

- **users** - Academic user accounts. Holds `nama_lengkap`, `nim_nip` (unique), `email` (unique), `no_telepon`, `status` (dosen/asdos/staff/mahasiswa), `total_tickets`, `daily_tickets`, `last_ticket_reset`, `is_active`.
- **admins** - Admin accounts, pre-seeded via `AdminSeeder`.
- **tickets** - String primary key `ticket_id` (`T000001` format), FK to `users.user_id`, `is_used` enum (available/used), timestamps.
- **complaints** - Main complaint records, FK to both `tickets` and `users`. FULLTEXT index over (`keluhan`, `kelas`, `lab`, `ruangan`) for duplicate-detection search. `is_hidden` flag for moderation.
- **complaint_status_history** - Append-only audit trail of status transitions with `changed_by_admin` FK.
- **feedbacks** - Rating (1-5) and comment, linked to the complaint and user.
- **feedback_responses** - Admin replies, one-to-many against feedbacks.
- **notifications** - Per-user and per-admin records with `type`, `title`, `message`, `related_complaint_id`, read state.
- **email_verifications** - 6-digit tokens for email updates, phone updates, and password resets (type column added later).
- **password_resets** - Legacy forgot-password table retained for compatibility.
- **admin_assistance_requests** - Queue of assisted flows (password reset help, email/phone change approvals).
- **personal_access_tokens** - Sanctum token store.

Primary FKs cascade on user deletion; `complaint_status_history.changed_by_admin` is set to `NULL` if the admin is removed so history survives.

---

## Security

- Laravel Sanctum API tokens for stateless authentication.
- Separate login endpoints for users (`/api/auth/login/user`) and admins (`/api/auth/login/admin`) so the two user spaces never cross-authenticate.
- `CheckUserActive` middleware rejects requests from deactivated accounts at the API boundary.
- Channel authorization in `routes/channels.php` ensures private channels are only joinable by their owner (user or admin) based on model class and id.
- 6-digit email verification tokens with 24-hour expiry for every sensitive change (email, phone, password reset).
- Passwords hashed with Laravel `Hash` (bcrypt).
- CORS configuration pinned to the frontend origin via `FRONTEND_URL`.

---

## Getting Started

### Prerequisites

- PHP 8.2 or newer with the standard Laravel extensions
- Composer 2.x
- Node.js 20+ and npm
- MySQL 8 (or compatible)
- A Pusher account (free tier is enough)
- An SMTP account for transactional mail (Mailtrap, Gmail App Password, etc. for development)

### Installation

```bash
git clone https://github.com/manrandomside/layanan-pengaduan-kebutuhan-akademisi-ticketing.git
cd layanan-pengaduan-kebutuhan-akademisi-ticketing

cp .env.example .env
composer install
npm install

php artisan key:generate
php artisan migrate --seed
```

Then run the three long-lived processes in separate terminals:

```bash
# Terminal 1 - Vite dev server (frontend)
npm run dev

# Terminal 2 - Laravel HTTP server (backend API)
php artisan serve

# Terminal 3 - Scheduler (daily ticket reset)
php artisan schedule:work
```

### Required Environment Variables

Populate the following keys in `.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cast
DB_USERNAME=root
DB_PASSWORD=

BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=ap1

VITE_PUSHER_APP_KEY="${PUSHER_APP_KEY}"
VITE_PUSHER_APP_CLUSTER="${PUSHER_APP_CLUSTER}"

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME="CAST"

SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Default Admin Accounts

Seeded by `AdminSeeder`:

| Username | Password |
|----------|----------|
| adminUPT1 | admin123 |
| adminUPT2 | admin123 |
| adminUPT3 | admin123 |

Change these credentials before shipping to any shared environment.

---

## Project Structure

```
.
+-- app/
|   +-- Console/Commands/
|   |   +-- ResetDailyTickets.php
|   +-- Events/
|   |   +-- ComplaintSubmitted.php
|   |   +-- ComplaintStatusChanged.php
|   |   +-- ComplaintHidden.php
|   |   +-- FeedbackSubmitted.php
|   |   +-- FeedbackReplied.php
|   |   +-- UserRegistered.php
|   |   +-- AssistanceRequestSubmitted.php
|   +-- Http/
|   |   +-- Controllers/Api/
|   |   |   +-- AuthController.php
|   |   |   +-- TicketController.php
|   |   |   +-- ComplaintController.php
|   |   |   +-- FeedbackController.php
|   |   |   +-- NotificationController.php
|   |   |   +-- ProfileController.php
|   |   |   +-- UserManagementController.php
|   |   |   +-- AdminAssistanceController.php
|   |   |   +-- PublicStatsController.php
|   |   +-- Middleware/
|   |       +-- CheckUserActive.php
|   +-- Mail/
|   |   +-- VerificationTokenMail.php
|   |   +-- PasswordResetTokenMail.php
|   +-- Models/
|   |   +-- User.php, Admin.php, Ticket.php, Complaint.php, ...
|   +-- Observers/
|       +-- ComplaintObserver.php
|       +-- FeedbackObserver.php
|       +-- FeedbackResponseObserver.php
|       +-- UserObserver.php
+-- database/
|   +-- migrations/          (15 schema migrations)
|   +-- seeders/
|       +-- AdminSeeder.php
|       +-- DatabaseSeeder.php
+-- resources/
|   +-- js/
|       +-- app.jsx
|       +-- Router.jsx
|       +-- bootstrap.js
|       +-- pages/
|       |   +-- admin/   (Dashboard, KelolaKeluhan, KelolaPengguna, AnalisisLayanan, BantuanUser, ProfileSettings)
|       |   +-- user/    (Dashboard, ComplaintForm, ComplaintList, ComplaintDetail, FeedbackForm, ProfileSettings)
|       |   +-- auth/    (LoginUser, LoginAdmin, Register, ForgotPassword)
|       |   +-- LandingPage.jsx
|       +-- Components/
|       +-- Layouts/
|       +-- contexts/
|       +-- config/
+-- routes/
|   +-- api.php       (REST endpoints)
|   +-- channels.php  (broadcast channel authorization)
|   +-- console.php   (scheduler definition)
|   +-- web.php
+-- composer.json
+-- package.json
+-- vite.config.js
```

---

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| No-approval ticket claim with daily cap | Keeps UX frictionless for users; the 3/day cap and 15 total ceiling make manual approval unnecessary while still preventing abuse. |
| Email-change token sent to the **new** address | Proves the user actually controls the destination mailbox before the change is applied. |
| Phone-change token sent to the **existing** email | An attacker with access to a phone alone should not be able to take over the account. Binding the change to the verified email blocks that path. |
| Admin password change without current password | Admin accounts are pre-seeded and managed internally by the organization, so the self-service friction is not warranted. |
| Client-side PDF generation | Zero server load, instant preview, and flexible styling; keeps the backend focused on data. |
| Hide / unhide instead of destructive delete | Preserves the audit trail and keeps moderation reversible. |
| Observer pattern for broadcasting | Decouples business logic from broadcast and notification-persistence concerns, so controllers stay thin and events fire consistently regardless of write path. |
| FULLTEXT index on complaints for duplicate search | Native MySQL FULLTEXT is fast enough at this scale and avoids adding a separate search service. |

---

## License

This project was built as an internship / practical work deliverable for **PT Citra Konsultama Indonesia**. All rights reserved to PT Citra Konsultama Indonesia.

---

<div align="center">

**Built for PT Citra Konsultama Indonesia**

Academic support, reimagined for real-time operations.

</div>
