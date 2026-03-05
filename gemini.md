# Prevalearn Project Architecture

Based on the project configuration and documentation, Prevalearn is built using a modern Client-Server architecture housed within a Monorepo.

Here is a breakdown of the architectural design and the preferred technology stack:

## 🏛️ Architecture Design
- **Architecture Pattern:** Client-Server Monorepo.
- **Backend Pattern:** Active Record Pattern.
- **Communication:** RESTful APIs for standard data fetching and WebSockets for real-time features.
- **Design System:** A custom minimalist, high-contrast design system prioritizing black, white, and gray, using accent colors strictly for status indicators (e.g., green for correct, red for errors).

## 💻 Client (Frontend)
The frontend is built for high speed, interactive data visualization, and real-time updates.

- **Core Framework:** React built with Vite for fast module bundling and hot-reloading.
- **Routing:** React Router for declarative routing.
- **State Management:**
  - **Zustand:** For lightweight, global client-side state.
  - **SWR (Stale-While-Revalidate):** Specifically preferred for fetching, caching, and managing server state.
- **Styling:** Tailwind CSS (configured with Prettier plugin `prettier-plugin-tailwindcss` for auto-sorting).
- **Key Packages:**
  - `axios`: For robust REST API requests.
  - `socket.io-client`: For real-time functionality.
  - `framer-motion`: For fluid UI micro-animations and page transitions.
  - `recharts`: For rendering insights and data visualizations on dashboards.
  - `lucide-react`: For consistent, clean SVG icons.
  - `posthog-js`: For user analytics.

## ⚙️ Server (Backend)
The backend is designed to handle AI workloads, real-time communication, and standard CRUD operations.

- **Runtime & Framework:** Node.js paired with Express.js.
- **Database:** MongoDB (with extensive use of local database seeding scripts for realistic development data).
- **AI Integration:**
  - **LangChain and Ollama:** Used locally or via proxies to power the AI-enhanced civil service review features.
- **Authentication & Security:**
  - `passport` & `passport-google-oauth20` for OAuth/social login.
  - `jsonwebtoken` (JWT) for session management.
  - `bcryptjs` for secure password hashing.
- **Key Packages:**
  - `socket.io`: Establishing the WebSocket server for real-time client updates.
  - `posthog-node`: For server-side analytics tracking.

## 🛠️ Development Tools
- **Package Manager:** pnpm (preferred for faster, disk-space efficient monorepo dependency management).
- **Formatting:** Prettier (strictly enforcing 2-space tabs, semi-colons, and double quotes).
- **Linting:** ESLint for frontend code quality.
