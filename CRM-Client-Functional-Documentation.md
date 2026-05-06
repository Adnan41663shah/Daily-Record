# EMS CloudBlitz CRM - Client Functional Documentation

## 1) Document Purpose

This document explains how the EMS CloudBlitz CRM works end-to-end for client and stakeholder review.

It covers:
- System architecture and code structure
- User roles and permissions
- Every major functional module
- Step-by-step business workflows
- API surface grouped by domain
- Data model and relationships
- Integrations, real-time behavior, and deployment notes

This documentation is based on the current implementation in this repository.

---

## 2) Product Overview

EMS CloudBlitz CRM is a role-based lead and admissions management platform designed for:
- Capturing and managing inquiries (leads)
- Assigning and progressing leads across Presales and Sales teams
- Tracking follow-ups and communication history
- Monitoring pipeline performance via dashboards and reports
- Handling call events and recordings through TeleCMI integration
- Managing options/master data and user accounts

Core departments in workflow:
- Presales
- Sales
- Admin (supervisory and configuration role)

---

## 3) High-Level Architecture

The platform is implemented as a monorepo with 4 main layers:

1. Frontend (React SPA)
- Location: `frontend`
- Role-based UI, dashboards, inquiry operations, reports, user and option management

2. Backend API (Express + MongoDB)
- Location: `backend`
- Authentication, business logic, inquiry lifecycle, dashboards, reports, integrations, internal events

3. Call Service (TeleCMI microservice)
- Location: `backend/call-service`
- Handles webhook ingestion (live + CDR), call record mapping, inquiry linking, recording stream

4. Shared Models Package
- Location: `packages/models`
- Canonical Mongoose schema definitions shared across backend services

### Runtime Data Flow
- User browser -> Frontend -> Backend `/api/*`
- TeleCMI -> Backend webhook proxy `/webhooks/telecmi/*` -> Call Service
- Call Service -> Backend internal route `/internal/ivr/events` for socket broadcasts
- Backend Socket.IO -> Frontend real-time notifications and call popups

---

## 4) Codebase Structure (Deep Dive)

## 4.1 Root
- `backend/` - primary API and business logic
- `backend/call-service/` - TeleCMI and recording service
- `frontend/` - web application
- `packages/models/` - shared entity schemas
- `docs/` - project documentation and migration guides

## 4.2 Backend (`backend/src`)

### `server.ts`
- Bootstraps Express app
- Configures security middleware (`helmet`, `mongoSanitize`)
- Configures CORS and rate limits
- Registers routes and global error handler
- Starts HTTP + Socket server

### `routes/`
- `auth.ts` - login, OAuth, profile
- `inquiry.ts` - inquiry lifecycle + dashboard/report endpoints
- `user.ts` - user administration
- `options.ts` - configurable option values
- `student.ts` - import and student list
- `integration.ts` - Microsoft Office365 sync APIs
- `ivr.ts` - IVR/recording APIs consumed by frontend
- `websiteForms.ts` - public website form ingestion
- `internal.ts` - internal service-to-service events
- `telecmiWebhookProxy.ts` - reverse proxy to call-service webhook endpoints
- `health.ts` - readiness/live checks

### `controllers/`
- Auth, users, options, integrations, students
- Inquiry controller split by responsibility:
  - `basicOperations.ts`
  - `assignmentOperations.ts`
  - `followUpOperations.ts`
  - `dashboardOperations.ts`
  - `reportOperations.ts`
  - `callOperations.ts`
  - `utilityOperations.ts`

### `services/`
- `socketService.ts` - user rooms, role rooms, targeted emits
- `recordingsService.ts` - recording-related business logic
- Additional supporting services for calls/pages

### `middleware/`
- JWT/session auth and role authorization
- Validation error handling
- Internal API protection
- Global error handling

### `helpers/`
- Dashboard aggregation logic
- Website form processing/upsert rules
- Inquiry utility helpers

## 4.3 Frontend (`frontend/src`)

### `App.tsx`
- Global providers (auth, socket, theme, react-query, recording player)
- Route definitions and role guards
- Lazy-loaded page modules for performance

### `pages/`
- Authentication: login/register/auth callback
- Dashboard and role-specific dashboard tabs
- Inquiry list/detail variants
- Calls and recordings UI
- Reports
- Users and manage options
- Conversions/admissions views

### `components/`
- Layout/navigation
- Filters and list controls
- Follow-up modal workflows
- Recordings player and admin containers

### `services/`
- API client and endpoint wrappers

### `contexts/`
- Auth state and session lifecycle
- Socket subscriptions
- Theme and recording player state

## 4.4 Call Service (`backend/call-service/src`)
- Receives and validates TeleCMI webhooks
- Normalizes provider payloads
- Upserts call events and call records
- Links calls to inquiries
- Sends internal IVR events to backend
- Exposes internal recording endpoint for backend proxying

## 4.5 Shared Models (`packages/models/src`)
- `User`
- `Inquiry`
- `Activity`
- `CallRecord`
- `CallProviderEvent`
- `Student`
- `ImportJob`
- `OptionSettings`

---

## 5) Roles, Access Model, and Permission Design

Roles implemented in system:
- `admin`
- `presales`
- `sales`

### 5.1 Admin
Primary responsibilities:
- User administration (create, update, activate/deactivate, role assignment)
- System options/master data management
- Full reporting and dashboard access
- Oversight access across presales/sales pipelines
- Integrations (Office365 sync)
- Student import management

### 5.2 Presales
Primary responsibilities:
- Inquiry creation and early-stage qualification
- Assigning inquiries to presales users
- Scheduling/managing follow-ups
- Forwarding eligible inquiries to sales
- Tracking own follow-up queue and dashboard metrics

### 5.3 Sales
Primary responsibilities:
- Claiming/handling sales-stage inquiries
- Follow-up execution and stage progression
- Updating conversion/admission status
- Center-focused inquiry and dashboard operations (as allowed by center permissions)

### 5.4 Additional Access Dimension: Center Permissions
`centerPermissions` on user profile restricts/permits center-level data visibility for relevant routes and dashboard slices.

### 5.5 Session and Security Behavior
- Inactive/disabled users are denied API and socket access
- Session token validity uses `authVersion` strategy
- Forced logout can be triggered on user status/auth changes

---

## 6) Functional Modules (Feature-by-Feature)

## 6.1 Authentication and Profile
Capabilities:
- Login/logout
- Microsoft OAuth authorization and callback handling
- One-time code exchange flow for token handoff
- Authenticated profile retrieval and update

Business impact:
- Centralized secure entry into CRM
- Controlled role-based experience from first load

## 6.2 Inquiry Management (Core CRM)
Capabilities:
- Create inquiry with role-aware validation
- List/search/filter inquiries
- Read inquiry detail with timeline/messages/follow-ups
- Update inquiry fields
- Delete inquiry (admin only)
- Duplicate prevention helper (`check-phone`)

Data captured:
- Lead identity and contact fields
- Academic and location preferences
- Source/medium/course/status mapping via option settings

## 6.3 Assignment and Ownership
Capabilities:
- Assign inquiry to user (presales/admin)
- Claim inquiry (sales/admin)
- Forward inquiry from presales to sales
- Reassign sales inquiry
- Bulk reassign sales inquiries (admin)

Business impact:
- Controlled lead transfer between departments
- Ownership clarity at every stage

## 6.4 Follow-Up Lifecycle
Capabilities:
- Add follow-up entry (type/date/status/message)
- Edit or delete follow-up
- Close follow-up with mandatory completion note
- My Follow-Ups API and UI queue

Support for sales journey:
- Lead stage and sub-stage fields with validation against configured lead stages

## 6.5 Communication and Activity
Capabilities:
- Append messages on inquiries
- WhatsApp contact logging
- Activity stream retrieval per inquiry

Business impact:
- Full audit trail of interactions and decisions

## 6.6 Dashboard and KPI Analytics
Capabilities:
- General dashboard stats
- Presales-only dashboard
- Sales-only dashboard
- Admin overview dashboard
- Center dashboard (admin/sales)

Typical metrics:
- New/unattended counts
- Follow-up status distributions
- Conversion/admission trend views
- User/team level workload and outcomes

## 6.7 Reports
Capabilities:
- Presales report summary and user drill-down
- Sales report summary and user drill-down
- Date-range and user-level performance analysis

Access:
- Admin only

## 6.8 User Management
Capabilities:
- Create/update user profile and role
- Activate/deactivate users
- Restrict risky operations (self-delete/critical checks)
- Trigger TeleCMI agent sync from user module

## 6.9 Option Settings (Master Data)
Capabilities:
- Manage globally used options such as:
  - Courses
  - Locations
  - Statuses
  - Mediums
  - Lead stages/sub-stages

Business impact:
- Keeps forms and workflow choices configurable without code changes

## 6.10 Website Form Intake
Public endpoint family accepts website lead forms:
- `salary-quiz`
- `syllabus-download`
- `be-a-mentor`
- `contact`
- `career-counseling`
- `hire-from-us`

Behavior:
- Creates or updates inquiry records
- Adds message trail for repeated submissions

## 6.11 Calls and IVR (TeleCMI)
Capabilities:
- Receive live/cdr webhook events
- Normalize and store provider event + call record
- Link call to inquiry when possible
- Create associated activities
- Emit real-time call popup/status events to UI
- Provide authorized recording access for frontend

## 6.12 Student Import Module
Capabilities:
- Upload/import student data (admin)
- Background processing with job status tracking
- Import result retrieval and list APIs

---

## 7) End-to-End Workflows (Step by Step)

## 7.1 User Login Workflow
1. User opens CRM login page.
2. User authenticates via supported auth flow (including Microsoft OAuth in configured environments).
3. Backend validates user status and role.
4. JWT/cookie session is established.
5. Frontend loads role-specific default pages and navigation.

## 7.2 Presales Lead Handling Workflow
1. Presales creates inquiry with mandatory validated fields.
2. Inquiry appears in presales inquiry views.
3. Presales adds first follow-up note and next action date.
4. Follow-ups are updated or closed over time with completion notes.
5. If inquiry qualifies for next stage, presales forwards to sales.

## 7.3 Sales Conversion Workflow
1. Sales views assigned/claimable inquiries.
2. Sales claims or receives reassigned inquiry.
3. Sales executes follow-ups and updates lead stage/sub-stage.
4. Sales updates conversion/admission status when milestone is reached.
5. Data contributes to sales dashboards and reports.

## 7.4 Admin Operations Workflow
1. Admin manages users and their role/center permissions.
2. Admin updates global options (courses, mediums, statuses, lead stages).
3. Admin monitors overall dashboards and reports.
4. Admin handles exception operations (bulk reassign, imports, integration sync).

## 7.5 Website Lead Capture Workflow
1. Website posts submission to CRM public form API.
2. Backend validates form type and payload.
3. Existing lead matching logic runs; system either creates or appends message trail.
4. Lead becomes available in operational inquiry queues.

## 7.6 Call Event Workflow (TeleCMI)
1. TeleCMI sends live/cdr webhook to backend.
2. Backend forwards request to call-service.
3. Call-service validates, maps, and stores event/call data.
4. Inquiry association is resolved/created based on call context.
5. Internal event is sent to backend.
6. Backend emits socket event to relevant online users for real-time visibility.

## 7.7 Call Recording Playback Workflow
1. Authorized user opens calls/recordings view.
2. Frontend requests recording using callRecord ID from backend IVR route.
3. Backend applies role/inquiry authorization checks.
4. Backend fetches recording stream from call-service internal API.
5. Frontend plays recording in integrated player.

---

## 8) Frontend Route and Screen Inventory

Public:
- Login
- Register
- Auth callback

Authenticated common:
- Dashboard
- Inquiry details
- My inquiries
- Profile
- Calls
- Center inquiries

Admin-only:
- Presales inquiries
- Sales inquiries
- Admin follow-ups and personal inquiry variants
- Users
- Manage options
- Reports

Presales-only:
- Presales follow-ups queue

Sales-only:
- Sales follow-ups queue
- Sales assigned inquiries
- Sales unified inquiries view

Admin + Sales:
- Admitted students
- Conversions
- Center dashboard

---

## 9) API Domain Map (Operational View)

System:
- Health/readiness/live checks

Auth:
- Register, login, logout
- Microsoft authorize/callback/exchange
- Profile get/update

Inquiries:
- CRUD, messages, activities
- Assignment/claim/forward/reassign/bulk reassign
- Follow-up create/update/close/delete
- Conversion/admission status update
- Counts, dashboard, reports, calls listing

Users:
- User lifecycle management
- TeleCMI agent sync trigger

Options:
- Retrieve/update global options

Students:
- Import, import job status, list

Integrations:
- Office365 user fetch/sync endpoints

IVR:
- Recordings list and fetch

Public website forms:
- Form type endpoint for multiple website funnels

Webhooks/internal:
- TeleCMI live and CDR ingress (proxied)
- Internal IVR event endpoint

---

## 10) Data Model and Entity Relationships

## 10.1 User
- Identity, role, session/auth version, integration fields, center permissions
- Referenced by inquiry ownership and activity logs

## 10.2 Inquiry
- Core lead record containing contact/profile fields and lifecycle flags
- References:
  - `createdBy -> User`
  - `assignedTo -> User`
  - `forwardedBy -> User`
- Embeds:
  - `messages[]` with user attribution
  - `followUps[]` with creator/completer attribution

## 10.3 Activity
- Timeline/audit record of actions on inquiries
- Links actor, target user, inquiry, optional call record

## 10.4 CallRecord
- Call metadata and provider identifiers
- Links to inquiry and optional attended user
- Includes recording metadata/path where available

## 10.5 CallProviderEvent
- Raw/normalized provider webhook event store
- Supports auditability and dedupe patterns

## 10.6 Student and ImportJob
- Student dataset for admissions/business operations
- ImportJob tracks asynchronous import processing state and metrics

## 10.7 OptionSettings
- Global configurable dictionary values used in validation and UI dropdowns

---

## 11) Real-Time and Notification Behavior

Realtime delivery is handled through Socket.IO:
- Role-based and user-based rooms
- Inquiry update notifications
- Dashboard refresh events
- IVR live call popup/status events
- Force logout signals on auth/session changes

Business value:
- Reduces operational delay between events and user action
- Keeps distributed teams synchronized during call and lead operations

---

## 12) Security, Validation, and Reliability Controls

Security controls:
- Helmet headers
- Mongo query sanitization
- CORS allowlist
- Rate limiting (general + auth-specific)
- Cookie and JWT-based protected route checks
- Internal service route protection

Validation controls:
- Detailed request schema checks via validators
- Role-aware mandatory field validation in inquiry create/update paths
- Lead stage and sub-stage consistency checks

Reliability controls:
- Health and readiness endpoints
- Error middleware and structured logging
- Background import job state tracking

---

## 13) Deployment and Environment Notes

Deployment components include:
- Backend container
- Call-service container
- MongoDB container
- Nginx and SSL routing (in production composition)

Environment configuration includes:
- DB/JWT/CORS/auth settings
- Integration credentials
- Internal service shared secrets
- Call-service connectivity variables

Operational caution for client handover:
- Ensure all secret values are managed through secure secret stores before production handoff.

---

## 14) Business Process Coverage Summary

The implemented CRM currently supports:
- Lead intake from internal users and public website forms
- End-to-end inquiry journey from new lead to conversion/admission outcome
- Department-specific operations for Presales and Sales
- Performance monitoring through dashboards/reports
- Real-time call and recording workflows via TeleCMI
- Administrative control over users and operational metadata

This provides a complete operational CRM loop from acquisition through closure with role-based governance.

---

## 15) Suggested Client Review Checklist

For sign-off sessions, review in this order:
1. Role and access matrix (Admin/Presales/Sales)
2. Inquiry lifecycle (create -> assign/claim -> follow-up -> forward -> convert/admit)
3. Dashboard and reports KPI expectations
4. Call/IVR flow and recording authorization
5. Website form ingestion and dedupe behavior
6. User and options administration ownership
7. Deployment and environment security checklist

---

## 16) Appendix - Main Implementation References

Primary backend bootstrap:
- `backend/src/server.ts`

Primary frontend route map:
- `frontend/src/App.tsx`

Core inquiry route definitions:
- `backend/src/routes/inquiry.ts`

Inquiry business logic modules:
- `backend/src/controllers/inquiryController.ts`
- `backend/src/controllers/inquiry/basicOperations.ts`
- `backend/src/controllers/inquiry/assignmentOperations.ts`
- `backend/src/controllers/inquiry/followUpOperations.ts`
- `backend/src/controllers/inquiry/dashboardOperations.ts`
- `backend/src/controllers/inquiry/reportOperations.ts`

TeleCMI and call-service:
- `backend/src/routes/telecmiWebhookProxy.ts`
- `backend/call-service/src/controllers/webhookController.ts`

Shared schema contracts:
- `packages/models/src/index.ts`

