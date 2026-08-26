# Low-Level Design (LLD) - Notes App

## 1. Database Schema & Data Modeling

### 1.1. `Note` Schema (`backend/models/Note.js`)
```javascript
const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Note', NoteSchema);
```

### 1.2. `User` Schema (`backend/models/User.js`)
```javascript
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50,
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: 1,
    max: 120,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
```

---

## 2. API Contract & RESTful Endpoint Design

### 2.1. Notes Endpoints (`/api/notes`)

| Method | Endpoint | Description | Request Body | Response (Success) | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/notes` | Fetch all notes (sorted by `createdAt` desc) | None | `Array<Note>` | `200 OK`, `500 Server Error` |
| **GET** | `/api/notes/:id` | Fetch single note by ID | None | `Note Object` | `200 OK`, `404 Not Found`, `500 Server Error` |
| **POST** | `/api/notes` | Create a new note | `{ title, content }` | `Created Note Object` | `201 Created`, `400 Bad Request`, `500 Server Error` |
| **PUT** | `/api/notes/:id` | Update an existing note | `{ title, content }` | `Updated Note Object` | `200 OK`, `404 Not Found`, `500 Server Error` |
| **DELETE**| `/api/notes/:id` | Remove note by ID | None | Empty Body | `204 No Content`, `404 Not Found`, `500 Server Error` |

### 2.2. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Request Body | Response (Success) | Status Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register user with name, age, email, password | `{ name, age, email, password }` | `{ message, token, user }` | `201 Created`, `400 Bad Request`, `409 Conflict`, `500 Server Error` |
| **POST** | `/api/auth/login` | Authenticate user & issue JWT | `{ email, password }` | `{ message, token, user }` | `200 OK`, `400 Bad Request`, `401 Unauthorized`, `500 Server Error` |
| **GET** | `/api/auth/me` | Fetch authenticated user profile | None (`Bearer <token>`) | `{ id, name, age, email }` | `200 OK`, `401 Unauthorized`, `404 Not Found`, `500 Server Error` |

---

## 3. Backend Module Specifications

### 3.1. Express Server (`server.js`)
- Initializes Express instance.
- Attaches global middleware: `cors()`, `express.json()`, `logger`.
- Mounts `/api/notes` and `/api/auth`.
- Attaches centralized `errorHandler`.

### 3.2. Middleware Functions
- **Logger (`middleware/logger.js`):** Logs method and request URL.
- **JWT Auth (`middleware/auth.js`):** Verifies Bearer token with `jwt.verify(token, JWT_SECRET)` and attaches `req.user`.
- **Error Handler (`middleware/errorHandler.js`):** Catches uncaught server errors.

---

## 4. Frontend Component Specifications & State Flow

```
                     +-------------------+
                     |    AuthProvider   |
                     | (user, token state|
                     +---------+---------+
                               |
                     +---------+---------+
                     |      App.jsx      |
                     |  (Router & Nav)   |
                     +----+----+----+----+
                          |    |    |
             +------------+    |    +------------+
             |                 |                 |
             v                 v                 v
     +---------------+ +---------------+ +---------------+
     | NotesList.jsx | | NoteForm.jsx  | | Register.jsx  |
     | (Notes Grid,  | | (Create/Edit, | | & Login.jsx   |
     |  Search,Toast)| |  JSON Import) | | (Auth Forms)  |
     +---------------+ +---------------+ +---------------+
```

### 4.1. Controlled Form Handling & Validation
- **`Register.jsx`:** Controlled inputs for `name`, `age`, `email`, `password`. Client-side regex & range validation, input sanitization, and loading/error states.
- **`Login.jsx`:** Controlled inputs for `email`, `password`. Client-side email validation and server auth error alerts.

---

## 5. Core Architectural & Security Concepts

| Concept | Location | Implementation Mechanism |
| :--- | :--- | :--- |
| **Input Sanitization & Injection Awareness** | `backend/routes/auth.js`, `frontend/src/components/Register.jsx` | Strict string/type checks against NoSQL operators (`$gt`, `$where`), trimming, lowercasing emails, casting age. |
| **Password Hashing** | `backend/routes/auth.js` | Uses `bcrypt.genSalt(10)` and `bcrypt.hash()` for storage, `bcrypt.compare()` for login. |
| **JWT Issuance & Verification** | `backend/routes/auth.js`, `backend/middleware/auth.js` | Signs JSON Web Tokens on register/login (`jwt.sign`) and verifies via middleware (`jwt.verify`). |
| **Request Body Validation** | `backend/routes/auth.js`, `backend/models/User.js` | Multi-layered validation on required fields, regex patterns, integer age boundaries, and password length. |
| **Controlled Inputs & Form Validation** | `frontend/src/components/Register.jsx`, `Login.jsx` | React `useState` controlled bindings, inline error state mapping, and client validation guards. |
| **Loading & Error UI States** | All Frontend Components | Button spinner animations, disabled submission states, and contextual alert banners. |
| **Closures** | `frontend/src/utils/helpers.js` | `createDebouncedSearch` and `createStatsTracker` maintain private lexical scope. |
| **Event Loop** | `frontend/src/utils/helpers.js` | `queueMicrotask` (Microtask Queue) for instant state setup, `setTimeout` (Macrotask Queue) for auto-dismissal. |
| **Hoisting** | `frontend/src/utils/helpers.js` | Function declarations hoisted for top-down code flow. |
| **Promises vs Callbacks** | `frontend/src/utils/helpers.js` | `readNoteFileWithPromise` wraps `FileReader` callbacks in modern Promises. |
