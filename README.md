# NetballClub Manager

A modern, offline-first netball club management application built with React, TypeScript, and Supabase. The app enables netball clubs to manage teams, players, events, and attendance while providing seamless offline functionality.

## 🏆 Features

- **Player Management**: Register and manage player profiles with guardian information
- **Team Organization**: Create and manage teams with age groups and categories
- **Event Scheduling**: Schedule training sessions, matches, and other events
- **Attendance Tracking**: Track player attendance and RSVP responses
- **Role-based Access**: Support for different user roles (admin, coach, manager, parent)
- **Offline-First**: Full functionality when offline with automatic sync when online
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🏗️ Architecture

### Offline-First Design

The application follows an **offline-first architecture** where all data operations happen locally first, then sync with the cloud when online.

```
Frontend (React/TypeScript)
    ↓
Offline API Layer
    ↓
IndexedDB (Dexie) ←→ Sync Service ←→ Supabase (PostgreSQL)
```

### Key Components

1. **IndexedDB as Primary Store** (`src/services/database.ts`)
   - Local database using Dexie.js
   - Stores all application data locally
   - Maintains a sync queue for pending operations

2. **Sync Service** (`src/services/syncService.ts`)
   - Handles bidirectional synchronization
   - Queues operations when offline
   - Syncs to Supabase when connection is restored

3. **Unified API Layer** (`src/services/offlineApi.ts`)
   - Single interface for all data operations
   - Abstracts away the complexity of offline/online states
   - Type-safe operations with consistent error handling

4. **Real-time Sync Status** (`src/hooks/use-offline.tsx`)
   - Monitors online/offline status
   - Provides sync status indicators
   - Enables manual sync triggers

### Data Flow

1. **User Action** → Offline API → IndexedDB (immediate response)
2. **Background** → Sync Queue → Supabase (when online)
3. **Conflicts** → Last-write-wins strategy (can be enhanced)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for cloud sync)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd netball-club-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Setup

The app uses Supabase for cloud sync. The connection details are configured in:
- `src/integrations/supabase/client.ts`

### Database Setup

The application automatically creates the IndexedDB schema on first run. For Supabase sync, ensure these tables exist:
- `guardians` - Parent/guardian information
- `players` - Player profiles and details
- `teams` - Team organization
- `events` - Training sessions and matches
- `event_responses` - Attendance and RSVP data
- `user_roles` - Role-based access control

## 📱 Usage

### Authentication

The app uses a simplified authentication system that works offline:
- Users are stored locally in IndexedDB
- Authentication state persists across sessions
- Default admin user: Create through registration

### Core Workflows

1. **Player Registration**
   - Parents register their children
   - Admin approval required
   - Automatic age group assignment

2. **Team Management**
   - Admins create teams by age group
   - Players assigned to appropriate teams
   - Team-specific events and communication

3. **Event Management**
   - Schedule training sessions and matches
   - Players RSVP for events
   - Coaches mark actual attendance

4. **Offline Operations**
   - All features work without internet
   - Data syncs automatically when online
   - Sync status visible in UI

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component primitives
- **React Router** - Navigation
- **React Hook Form** - Form management

### Data & Sync
- **Dexie.js** - IndexedDB wrapper
- **Supabase** - Backend as a service
- **PostgreSQL** - Cloud database
- **Custom Sync Service** - Offline/online synchronization

### Development
- **Vite** - Build tool
- **ESLint** - Code linting
- **Lovable** - AI-powered development platform

## 🔧 Configuration

### Offline Behavior
- Auto-sync every 30 seconds when online
- Manual sync via UI sync button
- Graceful degradation when offline

### Sync Strategy
- Local-first operations
- Background synchronization
- Conflict resolution via last-write-wins

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Design system components
│   └── SyncStatusIndicator.tsx
├── context/            # React context providers
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   └── use-offline.tsx
├── pages/              # Route components
├── services/           # Business logic
│   ├── database.ts     # IndexedDB operations
│   ├── syncService.ts  # Sync logic
│   ├── offlineApi.ts   # Unified API
│   └── supabaseApi.ts  # Supabase operations
├── types/              # TypeScript definitions
└── integrations/       # External service configs
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test offline and online functionality
5. Submit a pull request

## 📄 License

This project is built with [Lovable](https://lovable.dev) and follows their terms of service.

## 🆘 Support

For issues or questions:
- Check the browser console for sync errors
- Verify Supabase connection in network tab
- Review IndexedDB data in browser dev tools
- Ensure all required Supabase tables exist

---

**Note**: This application prioritizes offline functionality. All core features work without an internet connection, with automatic synchronization when connectivity is restored.