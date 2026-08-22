# High-Level Design (HLD) - Notes App

## 1. System Overview
The **Notes App** follows a decoupled 3-tier client-server architecture:
1. **Client Tier (Presentation Layer):** Single Page Application (SPA) built with React and Vite.
2. **Server Tier (Application Layer):** RESTful API built with Node.js and Express.
3. **Data Tier (Persistence Layer):** Document-oriented NoSQL database with MongoDB and Mongoose ODM.

---

## 2. Architecture Diagram

```
+-------------------------------------------------------------+
|                      Client (React SPA)                     |
|  - React Router (Client-side Routing)                       |
|  - Component Tree (App, NotesList, NoteItem, NoteForm)      |
|  - State Management (`useState`, `useEffect`)               |
|  - Async Fetch API / JavaScript `async/await`               |
+------------------------------+------------------------------+
                               |
                               | HTTP / JSON (Port 5000)
                               v
+-------------------------------------------------------------+
|                   Server (Express REST API)                 |
|  - Global Middleware: CORS, express.json(), Custom Logger   |
|  - Resource Routers: `/api/notes`                           |
|  - Centralized Error Handler Middleware                      |
+------------------------------+------------------------------+
                               |
                               | Mongoose ODM / TCP (Port 27017)
                               v
+-------------------------------------------------------------+
|                    Database (MongoDB)                       |
|  - Collection: `notes`                                      |
+-------------------------------------------------------------+
```

---

## 3. Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 | Declarative component-based UI rendering |
| **Build Tool** | Vite | Ultra-fast development server and optimized build bundling |
| **Client Routing** | React Router v6 | Client-side declarative routing without page reloads |
| **Backend Runtime** | Node.js | Asynchronous JavaScript runtime environment |
| **Web Framework** | Express 4 | HTTP routing, middleware pipeline, REST endpoint handling |
| **Database** | MongoDB | Schemaless document storage |
| **ODM** | Mongoose | Data modeling, validation, and query abstraction |
| **Styling** | Vanilla CSS (CSS Variables) | Lightweight, customizable dark theme design system |

---

## 4. Key Architectural Modules

### 4.1. Presentation Layer (Frontend)
- **App Root & Navigation:** Orchestrates top-level navigation, navbar header, and route views via `react-router-dom`.
- **View Components:**
  - `NotesList`: Handles asynchronous note retrieval on mount, empty states, and coordinates deletion.
  - `NoteItem`: Visual presentation for individual note cards with contextual actions (Edit/Delete).
  - `NoteForm`: Unified form component dynamically operating in Create mode (`POST`) or Edit mode (`PUT`).

### 4.2. Application Layer (Backend)
- **Middleware Pipeline:**
  - `cors`: Handles Cross-Origin Resource Sharing.
  - `express.json()`: Parses incoming JSON payloads into `req.body`.
  - `logger`: Custom logging middleware capturing HTTP method, path, and request lifecycle.
  - `errorHandler`: Centralized error middleware returning normalized `{ error: message }` responses.
- **RESTful Endpoints (`/api/notes`):**
  - Standard REST verbs adhering to semantic HTTP status codes.

### 4.3. Data Persistence Layer
- Managed by Mongoose connected to a MongoDB database instance.
- Defines validation rules for required fields and default timestamps (`createdAt`).

---

## 5. Security & Cross-Cutting Concerns
- **CORS Configuration:** Enables secure cross-origin requests from the React frontend running on port `5173`.
- **Input Validation:** Backend validation guarantees `title` and `content` existence before persistence.
- **Centralized Error Propagation:** Uncaught exceptions in async routes pass to `next(error)` to prevent process crashes.
- **Environment Configuration:** Sensitive credentials and port definitions isolated in `.env`.
