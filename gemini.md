# Produs Project Architecture

Based on the project configuration and documentation, Produs is built using a modern Client-Server architecture housed within a Monorepo.

Here is a breakdown of the architectural design and the preferred technology stack:

## 🏛️ Architecture Design
- **Architecture Pattern:** Client-Server Monorepo.
- **Backend Pattern:** Active Record Pattern.
- **Data Strategy:** **Local-First** — all core features (Habits, Journal, Planner, Finance) read and write to IndexedDB first via Dexie.js. Changes are synchronized to MongoDB in the background using Yjs CRDTs.
- **Communication:** RESTful APIs for standard data fetching, WebSockets for real-time features, and a dedicated `/api/sync/:feature` CRDT sync endpoint for offline-first reconciliation.
- **Design System:** A custom minimalist, high-contrast design system prioritizing black, white, and gray, using accent colors (Primary Blue) and category-specific colors for habits and metrics.

## 💻 Client (Frontend)
The frontend is built for high speed, interactive data visualization, real-time updates, and full offline functionality.

- **Core Framework:** React built with Vite for fast module bundling and hot-reloading.
- **Routing:** React Router for declarative routing.
- **State Management:**
  - **Zustand:** For lightweight, global client-side state.
  - **SWR (Stale-While-Revalidate):** Specifically preferred for fetching, caching, and managing server state.
- **Styling:** Tailwind CSS (configured with Prettier plugin `prettier-plugin-tailwindcss` for auto-sorting).
- **Local-First Stack:**
  - `dexie`: IndexedDB wrapper used as the client-side database for all feature data.
  - `dexie-react-hooks`: `useLiveQuery` for reactive UI updates from IndexedDB.
  - `yjs`: CRDT library for conflict-free data merging during sync.
  - `vite-plugin-pwa` + `workbox-*`: PWA support with service worker for background sync.
  - Feature hooks: `useHabitsLocal`, `useJournalLocal`, `usePlannerLocal`, `useFinanceLocal` — each manages its own Dexie table and Yjs CRDT state.
  - `SyncService.js`: Singleton that manages all Yjs docs, registers background sync tags, and calls `/api/sync/:feature` for each feature.
- **Key Packages:**
  - `axios`: For robust REST API requests.
  - `socket.io-client`: For real-time functionality.
  - `framer-motion`: For fluid UI micro-animations and page transitions.
  - `recharts`: For rendering insights and data visualizations on dashboards.
  - `lucide-react`: For consistent, clean SVG icons.
  - `posthog-js`: For user analytics.

## ⚙️ Server (Backend)
The backend handles real-time communication, data persistence, CRDT synchronization, and standard CRUD operations.

- **Runtime & Framework:** Node.js paired with Express.js.
- **Database:** MongoDB (with extensive use of local database seeding scripts for realistic development data).
- **Package Manager:** `pnpm` — do NOT use `npm install`. Always use `pnpm install` in both `client/` and `server/`.
- **Authentication & Security:**
  - `passport` & `passport-google-oauth20` for OAuth/social login.
  - `jsonwebtoken` (JWT) for session management.
  - `bcryptjs` for secure password hashing.
- **Sync Architecture:**
  - `YjsState` MongoDB model stores the binary Yjs document state per user per feature.
  - `/api/sync/:feature` (POST): Receives a Yjs update from the client, merges it into the server CRDT, hydrates the Y.Map from MongoDB if empty, saves back to both `YjsState` and the legacy models (e.g. `Habit`, `Journal`, `Task`), and returns the merged state.
  - `syncController.js`: Central CRDT sync controller. Contains `cleanPayload()` to strip `local-*` string IDs and malformed BSON objects before writing to Mongoose.
  - System habits (`journal`, `finance`, `planner`) are force-hydrated into the Yjs map on every sync to ensure they always appear as locked rows in the Habits Tracker.
- **Key Packages:**
  - `socket.io`: Establishing the WebSocket server for real-time client updates.
  - `posthog-node`: For server-side analytics tracking.

## 🏆 Challenges System
These are the evergreen challenges that define the Produs experience. They focus on the fundamental pillars of productivity: Focus, Planning, and Consistency.

### Evergreen Challenges
| Challenge Name | Goal | Duration | Visual Accent |
| :--- | :--- | :--- | :--- |
| **The Deep Work 50** | Complete 50 cumulative hours of "Deep Work" sessions. | Ongoing | Primary Blue |
| **Inbox Zero Hero** | Maintain a clear email/task inbox for 7 consecutive days. | 7 Days | Neutral Gray |
| **The Rule of Three** | Define and complete your "Top 3" tasks every single day. | 14 Days | Primary Blue |
| **The Pomodoro Master** | Complete 8 focus intervals (25/5) in a single workday. | Daily | High-Contrast White |
| **Analog Morning** | No digital screens for the first 60 minutes after waking up. | 21 Days | Primary Blue |
| **The Shutdown Ritual** | Log a 10-minute planning session for the next day before 6 PM. | 30 Days | Neutral Gray |

### 🗓️ The Monthly Rotation (March 2026)
Since we are in March, these seasonal challenges focus on "Spring Cleaning" your digital workflow and building momentum for the end of Q1.

1.  **The "Digital Declutter" (March Special)**
    *   **The Mission:** Delete 5 unused apps, organize your desktop folders, and unsubscribe from 10 "junk" newsletters.
    *   **Why now?** Clearing the "noise" before the second quarter begins.
2.  **The "March Momentum" Sprint**
    *   **The Mission:** Complete at least one "Deep Work" session every weekday for the entire month.
    *   **Why now?** Building the stamina needed for longer projects as the year ramps up.
3.  **The "Flow State" Collaboration**
    *   **The Mission:** Join a "Live Focus Room" (using your WebSockets/Socket.io feature) and work alongside others for 2 hours.
    *   **Why now?** Utilizing the community aspect of Produs to fight the "mid-month slump."
