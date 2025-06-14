# Product Requirements Document (PRD)
## Netball Club Management System

### 1. Overview
The Netball Club Management System is designed to digitise and streamline the operations of community and school-based netball clubs. It supports registration, approvals, team management, events, attendance, performance tracking, and role-based permissions. The system is designed for parents, coaches, managers, and administrators to use with distinct access levels and responsibilities.

---

### 2. User Roles and Access

#### Parent:
- Register an account.
- Add one or more children with personal and medical details.
- Manage profile and consent preferences.
- Request a team placement for each child.
- RSVP to events on behalf of their children.
- View their children's attendance and performance stats.
- Handle subscription payments for their children.

#### Coach:
- View teams they are assigned to.
- Create, edit and cancel events for those teams.
- Record attendance and post-match performance stats.
- Approve or reject children assigned to their team(s).

#### Manager:
- All Coach permissions.
- Manage team rosters.
- Assign players to teams.
- Assist with approvals and user management for assigned teams.

#### Admin:
- Full access to all users, teams, events, and settings.
- Create and manage teams.
- Assign or remove roles from users.
- Approve or reject all types of users and players.
- Monitor club-wide participation and performance data.

---

### 3. User Registration & Approval Flow

#### Parent Registration:
- Complete a form with personal info, contact details, profile picture, and password.
- Accept T&Cs, Code of Conduct, and photo consent.
- Add one or more children, including name, DOB, medical info, notes, profile image, and optional team preference.
- System auto-assigns age group based on UK school year.
- Registration enters a pending state awaiting approval.

#### Approval Process:
- Admin, coach, or manager can view pending approvals.
- Approver can modify child details and assign teams.
- Approving a child also approves the parent.
- Rejected users are notified and flagged.

---

### 4. Profiles

#### User Profile:
- View and edit personal information.
- Upload profile photo.
- Display assigned roles and linked teams.

#### Child Profile:
- View and edit details.
- Show assigned team, age group, medical notes, and performance summary.
- Manage photo and see attendance history.

---

### 5. Role Management

#### Role Assignment:
- Admins can assign or remove roles from any user.
- Coaches and Managers are also linked to one or more teams.

#### Permissions Enforcement:
- Access to views and data throughout the system is restricted by role.
- Coaches and Managers only see data for their assigned teams.
- Admins have global access.

---

### 6. Teams

#### Team Creation:
- Admins create teams with:
  - Name
  - Age group (U6–U16)
  - Category (Junior, Senior, Mixed)
  - Profile image, banner image, circular icon
  - Description

#### Team Management:
- Coaches and managers can view, edit, and manage players on their teams.
- Enforce age group eligibility when assigning children to teams.

---

### 7. Events

#### Event Types:
- Training (recurring)
- Match (includes opposing team and post-match stats)
- Other (e.g. social events)

#### Event Creation:
- Roles: Admins, Coaches, and Managers
- Required: name, date/time, location, notes, event type, team
- Optional recurrence for training

#### RSVP & Attendance:
- Players/parents can RSVP (Going, Not Going, Maybe)
- Coaches mark attendance (Present, Absent, Injured, Late)
- Attendance affects stats

#### Event Views:
- Calendar view with filters
- List view for all events
- Filter by event type, team, RSVP status

---

### 8. Match Statistics

#### Stats Captured:
- Goals, Shot Attempts
- Intercepts, Tips
- Turnovers Won/Lost
- Contacts, Obstructions
- Footwork errors
- Quarters played
- Player of the Match (Coaches' and Players' choices)

#### Entry Process:
- Coaches/managers enter data post-match
- Stats stored against each player per event

#### Reporting:
- Per-player and per-team breakdowns
- Graphs and sortable tables for stats
- Win/loss ratios, attendance rates, and performance trends

---

### 9. Subscription Management

#### Payments:
- Monthly fixed subscription per child
- Linked to one guardian (the bill payer)
- View transaction history per user

#### Management:
- Parents can cancel/manage their subscription
- Admins can see payment status for reporting

---

### 10. Admin Tools

#### System Admin Features:
- Full user and child search and edit capabilities
- Role management tools per user profile
- Team setup and reassignment tools
- Event monitoring across all teams
- Club-level reporting on participation, payments, and performance