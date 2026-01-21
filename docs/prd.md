# Arius — Product Requirements Document (PRD)

**Project**: Arius — Mobile-First CRM for Field Sales Representatives  
**Version**: 1.0  
**Date**: 15 janvier 2026  
**Author**: PM Agent (BMad Orchestrator)  
**Status**: Ready for UX Expert & Architect Review

---

## 1. Goals and Background Context

### Goals

- Provide a mobile-first CRM application that centralizes, structures, and enables rapid access to all commercial information directly in the field
- Replace Excel-based customer management with a dedicated, professional, and maintainable tool
- Deliver a stable, maintainable MVP with clear evolution path for future features
- Ensure complete data ownership and portability for each user
- Enable field sales representatives to manage clients, contacts, meetings, quotes, and revenue tracking without dual-source management

### Background Context

The project addresses a real-world need: field sales representatives currently manage customer relationships using Excel spreadsheets due to lack of affordable, mobile-accessible CRM solutions. This approach is fragmented (information scattered across files), inflexible (difficult to access on mobile), and unsustainable (no follow-up structure, no visibility into overall commercial activity).

A previous PWA prototype was built rapidly using AI generation, but lacks architectural foundation for maintenance and evolution. Arius reimplements this as a professional, React Native-based application designed for real-world daily use by a field sales team, starting with a single commercial user (a field sales representative) and extensible to multiple users.

The project serves dual purposes: **pedagogical** (CDA capstone project demonstrating full-stack competencies) and **practical** (replacing actual Excel workflows in a real business context).

### Change Log

| Date       | Version | Description                         | Author   |
| ---------- | ------- | ----------------------------------- | -------- |
| 2026-01-15 | 1.0     | Initial PRD from cahier des charges | PM Agent |

---

## 2. Functional Requirements

| #    | Requirement                | Description                                                                                                                        | MVP | Status |
| ---- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --- | ------ |
| FR1  | Company Management         | Create, read, update, delete company profiles with status (Client, Prospect, À réactiver, Fournisseur), address, description, logo | ✅  | Core   |
| FR2  | Company Data Fields        | Name, status, address (rue, code postal, ville, pays), description, logo (optional), created_at, updated_at                        | ✅  | Core   |
| FR3  | Contact Management         | Create, read, update, delete contacts linked to companies; define primary contact                                                  | ✅  | Core   |
| FR4  | Contact Data Fields        | First name, last name, title, email, phone direct, phone mobile, primary flag, comment                                             | ✅  | Core   |
| FR5  | Notes - Manual & Templates | Add notes with auto-timestamp; support predefined templates (Pas de réponse, Message laissé, Relance nécessaire, etc.)             | ✅  | Core   |
| FR6  | Meeting Management         | Schedule, view, update, cancel meetings; track past and upcoming meetings                                                          | ✅  | Core   |
| FR7  | Meeting Data               | Title, description, scheduled_at, duration_minutes, status (planned, completed, cancelled)                                         | ✅  | Core   |
| FR8  | Quote Management           | Upload and manage quote documents (PDF, Word, etc.); retrieve documents from app                                                   | ✅  | Core   |
| FR9  | Revenue Tracking           | Record monthly revenue per company; view annual summary table                                                                      | ✅  | Core   |
| FR10 | Dashboard                  | Display total revenue (month, YTD), progress toward revenue targets, company counts, upcoming meetings, recent activity            | ✅  | Core   |
| FR11 | Data Export                | Export all user data as Excel file (companies, contacts, meetings, notes, revenue)                                                 | ✅  | Core   |
| FR12 | User Authentication        | Email/password authentication; future evolution to Google OAuth possible                                                           | ✅  | Core   |
| FR13 | User Isolation             | Each user sees only their own data; server-side enforcement                                                                        | ✅  | Core   |
| FR14 | Multi-Platform Support     | Works on Android mobile and web browser (React Native Web) using identical codebase                                                | ✅  | Core   |
| FR15 | Quick-Add Notes            | Single-tap note creation with preset templates for minimal disruption to workflow                                                  | ✅  | Core   |
| FR16 | Contact Primary Flag       | Ability to designate one contact as primary; quick-call from primary contact                                                       | ✅  | Core   |

---

## 3. Non-Functional Requirements

| #     | Requirement                | Description                                                                                                            | MVP |
| ----- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --- |
| NFR1  | Code Quality               | Maintainable, well-documented codebase following React Native best practices; solo developer capability                | ✅  |
| NFR2  | API Design                 | RESTful, stateless API; deployable via Coolify on VPS                                                                  | ✅  |
| NFR3  | Database                   | Relational database (PostgreSQL); supports user isolation at application and database level                            | ✅  |
| NFR4  | Security                   | HTTPS communication; JWT token-based authentication; password hashing (bcrypt); all API requests validated server-side | ✅  |
| NFR5  | Performance - Load Time    | Initial app load < 3 seconds on 4G network                                                                             | ✅  |
| NFR6  | Performance - Transitions  | Screen transitions < 1 second                                                                                          | ✅  |
| NFR7  | Performance - API Response | API response time < 500ms (p95)                                                                                        | ✅  |
| NFR8  | Mobile-First Design        | Primary interaction optimized for touchscreen; secondary support for web browser; responsive layouts                   | ✅  |
| NFR9  | Android Support            | Android as primary platform; iOS future consideration                                                                  | ✅  |
| NFR10 | Styling Framework          | TailwindCSS for all UI styling (mobile + web); components reusable and composable                                      | ✅  |
| NFR11 | Authentication Library     | Better Auth for streamlined email/password + future OAuth integration                                                  | ✅  |
| NFR12 | Environment Configuration  | No hardcoded API URLs; configuration via environment variables (.env for dev, Coolify for production)                  | ✅  |
| NFR13 | Testing                    | Unit + Integration tests for backend; component + integration tests for frontend                                       | ✅  |
| NFR14 | Pagination                 | Large datasets paginated; avoid loading 1000+ items at once                                                            | ✅  |
| NFR15 | Logging                    | Structured logging on backend; error tracking optional (Sentry)                                                        | ✅  |

---

## 4. User Interface Design Goals

### Overall UX Vision

Arius is a **mobile-first, touch-optimized CRM** designed for field sales professionals working on the go. The interface prioritizes:

- **Single-purpose screens**: Each screen has one primary action (create, view, list, edit, export)
- **Bottom-tap accessibility**: Controls positioned within thumb reach for mobile (44px+ touch targets)
- **Minimal cognitive load**: Flat navigation, clear action buttons, consistent interaction patterns
- **Context preservation**: Quick access to related entities (Company → Contacts | Meetings | Notes | Revenue | Quotes)
- **Offline resilience**: Critical features work offline; sync when connected (future enhancement)

### Key Interaction Paradigms

1. **Context-driven drill-down**: Users navigate from Company list → Company detail → Related entities (contacts, meetings, notes, revenue)
2. **Quick-add patterns**: Fast data entry for frequent actions (add note with templates, schedule meeting, record revenue)
3. **Gesture-friendly**: Tap, swipe, long-press for common operations; pull-to-refresh for list updates
4. **Tabular list views**: Sortable, filterable lists with status badges and at-a-glance indicators
5. **Modal/drawer workflows**: Edit forms open as overlays, preserving context

### Core Screens and Views

| Screen                  | Purpose               | Features                                                                                                         |
| ----------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Login**               | User authentication   | Email/password input, registration link, error handling                                                          |
| **Registration**        | Account creation      | Email, password, confirm password, validation feedback                                                           |
| **Company List (Home)** | View all companies    | Paginated list, status badges, search/filter, pull-to-refresh, FAB to create                                     |
| **Company Detail**      | View single company   | Full details, tabs (Contacts\|Meetings\|Notes\|Revenue\|Quotes), edit/delete buttons                             |
| **Contact List**        | View company contacts | All contacts, primary flag, quick-call, create contact button                                                    |
| **Contact Detail/Edit** | View/edit contact     | All fields, save, delete, quick-call, email intent                                                               |
| **Meeting List**        | View meetings         | Upcoming & past tabs, chronological order, status colors, create button                                          |
| **Meeting Detail/Edit** | View/edit meeting     | Title, description, date/time, duration, status selector, delete                                                 |
| **Notes View**          | View company notes    | Chronological list, quick-add templates (single-tap), manual entry modal, delete per note                        |
| **Revenue Tracker**     | View/edit revenue     | Annual table (months × companies), monthly totals, previous/next year navigation                                 |
| **Dashboard**           | Key metrics           | Total revenue (month, YTD), revenue target progress, company/prospect counts, upcoming meetings, recent activity |
| **Settings**            | Account & preferences | Email display, revenue target input, logout, export data, account deletion (optional)                            |
| **Quote Viewer**        | View documents        | PDF/document display from uploaded files                                                                         |

### Accessibility Requirements: WCAG AA

- Color contrast minimum 4.5:1 for text
- Touch targets minimum 44px × 44px
- Text resizing support
- Keyboard navigation (web version)
- Status badges use color + icon or text labels (not color-only)

### Branding & Visual Design

No specific brand guidelines provided. Recommended default:

- **Color palette**: Professional blues, greens, grays
  - Prospect: Blue (#2563eb)
  - Client: Green (#16a34a)
  - À réactiver: Yellow/Amber (#f59e0b)
  - Fournisseur: Gray (#6b7280)
- **Typography**: System fonts (clean, readable on mobile)
- **Spacing**: Consistent 8px, 16px, 24px grid
- **Style**: Clean, modern, business-appropriate

### Target Devices & Platforms

- **Primary**: Android mobile phones (and tablets)
- **Secondary**: Web browser via React Native Web (responsive, tablet-friendly)
- **Not in scope**: iOS (future consideration), native publication to app stores

---

## 5. Technical Assumptions & Stack

### Repository Structure (Monorepo)

```
arius/
├── apps/
│   ├── mobile/          # React Native (Expo)
│   └── web/             # React Native Web
├── packages/
│   ├── api/             # Express.js backend
│   ├── shared/          # Shared TypeScript types, utilities
│   └── db/              # Database migrations, schema, seeds
├── package.json         # Workspace root
└── README.md
```

**Rationale**: Single codebase simplifies maintenance for solo developer; shared types reduce duplication; centralized database management prevents drift.

### Backend Architecture

- **Framework**: Express.js (Node.js)
- **ORM**: Prisma or Sequelize or TypeORM (choose one)
- **Authentication**: Better Auth library + JWT middleware
- **Password Hashing**: bcrypt
- **Logging**: Winston or Pino (structured JSON)
- **API Documentation**: OpenAPI/Swagger (auto-generated)
- **Deployment**: VPS with Coolify (auto-deploy on git push to main branch)

### Frontend Architecture

- **Mobile**: React Native with Expo (simplified dev & EAS builds)
- **Web**: React Native Web (same codebase as mobile)
- **Routing**: React Navigation (stack navigator for mobile)
- **State Management**: Context API or Zustand or Redux (choose one)
- **HTTP Client**: Axios or Fetch API
- **Styling**: TailwindCSS + NativeWind for React Native
- **Error Boundary**: Custom error handling + Toast/Snackbar notifications

### Database

- **Engine**: PostgreSQL
- **Schema**: Relational with user isolation constraints
- **Connection Pooling**: Enabled for production
- **Migrations**: Version-controlled migration framework
- **Backup Strategy**: Daily backups on VPS

### Deployment

- **Server**: VPS (any provider with SSH access)
- **Deployment Tool**: Coolify (open-source, self-hosted)
- **CI/CD**: Webhook-based auto-deploy on git push
- **Environment Variables**: Managed by Coolify; includes JWT_SECRET, DATABASE_URL, API_URL, etc.
- **SSL/HTTPS**: Let's Encrypt via Coolify

### Testing Strategy

- **Backend**: Jest + Supertest for API integration tests; unit tests for business logic
- **Frontend**: Jest + React Testing Library for component tests; integration tests for key user flows
- **Manual Testing**: User acceptance testing by field sales rep (stakeholder) before release
- **No e2e automation**: Manual testing sufficient for MVP

---

## 6. Epic List

### Epic Sequencing Rationale

Epics are structured to deliver value incrementally while respecting forward dependencies. Each epic establishes infrastructure while delivering user-facing functionality:

- **Epic 1 (Foundation)**: Project setup, authentication, company CRUD → Minimum viable app skeleton
- **Epic 2 (Core Entities)**: Contacts, Notes, Meetings → Extended company profile with interactions
- **Epic 3 (Business Tracking)**: Revenue tracking, Dashboard, Data Export → Sales performance visibility
- **Epic 4 (Refinement)**: Testing, documentation, optimization, VPS deployment → Production-ready

### Epic 1: Foundation & Core Infrastructure

**Goal**: Establish monorepo structure, authentication system, and company management. Deliver a working baseline application that proves core architecture.

**Deliverables**:

- Monorepo with organized workspace structure
- Express.js backend with middleware, error handling, environment config
- PostgreSQL database with ORM and migration framework
- User registration & login (JWT-based)
- Company CRUD endpoints with user isolation
- React Native mobile app with navigation scaffolding
- Login & Registration UI screens
- Company List UI with pagination
- Company Detail UI with tab structure

**Stories**: 1.1 through 1.10 (approx. 10 stories)

### Epic 2: Core Business Entities

**Goal**: Extend company profiles with contacts, notes, and meetings. Enable field sales reps to document interactions and manage relationships comprehensively.

**Deliverables**:

- Contact management (CRUD endpoints + UI)
- Notes with templates (CRUD endpoints + quick-add UI)
- Meeting scheduling (CRUD endpoints + UI)
- Full company detail screen with all tabs functional

**Stories**: 2.1 through 2.8 (approx. 8 stories)

### Epic 3: Business Performance & Export

**Goal**: Provide revenue tracking, dashboard insights, and complete data export. Enable sales reps to measure performance and maintain data ownership.

**Deliverables**:

- Revenue tracking (endpoints + UI)
- Dashboard with aggregated metrics
- Data export to Excel (endpoint + UI button)
- Settings screen with logout and preferences

**Stories**: 3.1 through 3.7 (approx. 7 stories)

### Epic 4: Refinement & Production Readiness

**Goal**: Optimize performance, increase test coverage, finalize documentation, and prepare for production deployment on VPS.

**Deliverables**:

- Comprehensive API test suite (≥70% coverage)
- Component & integration tests for mobile/web
- Performance optimization (load times, bundle size, API response)
- Error handling & user feedback improvements
- API documentation & OpenAPI spec
- Deployment setup & Coolify configuration
- Mobile app build (APK/AAB)
- Web build (React Native Web)
- Complete project documentation (README, setup guides, deployment guide)
- Production readiness checklist & UAT sign-off

**Stories**: 4.1 through 4.10 (approx. 10 stories)

---

## 7. MVP Scope Definition

### In Scope for MVP (Epics 1-2)

- ✅ Company management (CRUD)
- ✅ Contact management (CRUD)
- ✅ Notes with templates (quick-add)
- ✅ Meetings (scheduling, tracking, history)
- ✅ User authentication (email/password)
- ✅ User isolation (data privacy)
- ✅ Mobile-first UI (Android + web)
- ✅ Deployment on VPS

### Out of Scope for MVP (Epics 3-4, Future)

- ❌ Revenue tracking (Epic 3 - nice-to-have, low priority)
- ❌ Dashboard with advanced metrics (Epic 3 - future)
- ❌ Data export (Epic 3 - future)
- ❌ Calendar synchronization (mentioned as optional - future)
- ❌ Notifications (mentioned as out of scope - future)
- ❌ Advanced graphical reporting (mentioned as out of scope - future)
- ❌ iOS support (Android primary - future)
- ❌ App store publication (future)
- ❌ Advanced role-based access control (future)

**Rationale**: MVP focuses on core CRM functionality (companies, contacts, notes, meetings) to replace Excel workflows. Revenue, export, and advanced features follow in subsequent phases.

---

## 8. Next Steps

### Phase 2: UX Expert (Coming Next)

**Task**: Create detailed **front-end specification** document that provides:

1. **Design System**: Color palette, typography, spacing, component library
2. **Screen Designs**: Wireframes or detailed descriptions for all core screens
3. **Interaction Flows**: Navigation, form validation, success/error states
4. **Mobile-First Approach**: Touch targets, gesture support, responsive layouts
5. **React Native Implementation**: Component structure, styling patterns, state management
6. **Accessibility**: WCAG AA compliance implementation details
7. **Responsive Design**: Tablet and web browser adaptations

**Input**: This PRD + project technical constraints  
**Output**: `docs/front-end-spec.md`

### Phase 3: Architect (After UX)

**Task**: Create comprehensive **fullstack architecture** document that provides:

1. **System Overview**: Client-server model, monorepo deployment
2. **Backend Architecture**: Express structure, middleware, error handling
3. **Database Schema**: Complete PostgreSQL schema with relationships and constraints
4. **Authentication Flow**: JWT implementation, password hashing, user isolation
5. **Frontend Architecture**: React Native component hierarchy, state management, routing
6. **API Specification**: RESTful endpoints, request/response schemas, error codes
7. **Deployment Guide**: VPS setup, Coolify configuration, environment management
8. **Technology Stack Decisions**: Library choices with rationale

**Input**: This PRD + front-end specification  
**Output**: `docs/fullstack-architecture.md`

### Phase 4: Development (After Architecture Sign-Off)

Implementation begins with Epic 1: Foundation & Core Infrastructure

---

## 9. Document Information

**Format**: Markdown  
**Generated**: 15 janvier 2026  
**Source**: Cahier des charges officiel Arius (January 2026)  
**Validation Status**: Ready for UX Expert & Architect review  
**Next Review**: After architecture sign-off, pre-development  
**Last Modified**: 15 janvier 2026
