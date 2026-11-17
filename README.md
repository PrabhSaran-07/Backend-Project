# The MERN Book Catalog

A production-ready full-stack web application built with **React + Vite**, **Express.js**, and **MongoDB / Mongoose**.

A signed-in user can add a book, find it by title or author, correct its publication year, and remove it from the shared catalog. The project models books and user accounts. Sales, checkout, borrowing, and returns fall outside its implemented scope.


Live Website: https://backend-project-eta-lovat.vercel.app
---

## Architecture: How the Three Layers Work Together

```
┌────────────────────────────────────────────────────────┐
│                   01 BROWSER: React + Vite              │
│  - Displays forms, tables, and pagination buttons       │
│  - Axios sends HTTP requests with Bearer JWT tokens     │
│  - Interactive 5-step tour stored in local storage      │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP JSON API Requests
                            ▼
┌────────────────────────────────────────────────────────┐
│                02 API SERVER: Node.js + Express         │
│  - server.js mounts /api/auth and /api/books routers    │
│  - Verifies token signature and expiry via middleware   │
│  - Executes book & auth controllers                     │
└───────────────────────────┬────────────────────────────┘
                            │ Mongoose Queries
                            ▼
┌────────────────────────────────────────────────────────┐
│              03 DATABASE: MongoDB + Mongoose            │
│  - Stores user documents with bcrypt password hashes    │
│  - Stores book records (title, author, year, timestamps)│
│  - Runs parallel search & count queries                 │
└────────────────────────────────────────────────────────┘
```

A request travels down these layers. Its result travels back as JSON, and React updates the table. Only the API connects to the database.

---

## Where to Start Reading

- **Client**: [`client/src/App.jsx`](client/src/App.jsx) defines the screens, navigation, and dashboard layout.
- **Server**: [`server/server.js`](server/server.js) mounts routers under `/api/auth` and `/api/books`.
- **Controllers**:
  - [`server/controllers/authController.js`](server/controllers/authController.js) handles registration, password hashing with bcrypt, login JWT generation, and token verification.
  - [`server/controllers/bookController.js`](server/controllers/bookController.js) handles case-insensitive regex search, 5-per-page parallel query pagination, creation, edits, and deletions.
- **Client Dashboard**: [`client/src/pages/Books.jsx`](client/src/pages/Books.jsx) handles search input resets, loading states, modals, and pagination buttons.

---

## Project Structure

```text
Backend Project/
├── client/                     # Frontend (React 18, Vite, React Router, Axios)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js        # Axios instance with Bearer token interceptor
│   │   ├── components/
│   │   │   ├── BookModal.jsx   # Controlled form for Add / Edit (year correction)
│   │   │   ├── DeleteConfirmModal.jsx # Delete confirmation prompt
│   │   │   ├── Navbar.jsx      # Navigation bar with user status & Tour trigger
│   │   │   ├── ProtectedRoute.jsx # Guards /books route
│   │   │   └── TourGuide.jsx   # 5-step tour remembering completion in browser
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Auth state, login, register, logout, session check
│   │   ├── pages/
│   │   │   ├── Books.jsx       # Catalog dashboard with search & pagination
│   │   │   ├── Login.jsx       # Sign in screen
│   │   │   └── Register.jsx    # User registration screen
│   │   ├── App.jsx             # Router and screen definitions
│   │   ├── index.css           # Styling system
│   │   └── main.jsx            # React root mount
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Backend API (Node.js, Express, Mongoose)
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Me endpoints
│   │   └── bookController.js   # Search, pagination, CRUD
│   ├── middleware/
│   │   └── authMiddleware.js   # Bearer JWT signature & 1-hour expiry check
│   ├── models/
│   │   ├── Book.js             # title, author, year, createdBy, timestamps
│   │   └── User.js             # username, email, hashed password, timestamps
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth routes
│   │   └── bookRoutes.js       # /api/books routes
│   ├── .env.example
│   ├── package.json
│   └── server.js               # Express entrypoint, mounts routers & health check
│
├── package.json                # Root convenience scripts
└── README.md
```

---

## API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Create a user account (`username`, `email`, `password`). |
| **POST** | `/api/auth/login` | Public | Verify credentials and return signed JWT (valid 1 hour) and user details. |
| **GET** | `/api/auth/me` | Token required | Return decoded token claims and user profile. |

### Books (`/api/books`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/books` | Public | Return a filtered page of books. Supports `?page=1&limit=5&search=term`. |
| **POST** | `/api/books` | Token required | Create a book with `title`, `author`, and `year`. |
| **PUT** | `/api/books/:id` | Token required | Update a book's details or correct its publication year. |
| **DELETE** | `/api/books/:id` | Token required | Delete a book by ID. |

---

## Search & Pagination Details

1. **Typing Search Term**:
   Typing updates React search state and immediately resets the page to 1. `useEffect` in `Books.jsx` listens to changes on `[page, searchTerm]` and triggers Axios:
   ```
   GET /api/books?page=1&limit=5&search=martin
   ```
2. **Controller Regex Matching**:
   The controller trims the term and builds a case-insensitive regular expression:
   ```javascript
   const regex = new RegExp(escapeRegex(searchTerm), 'i');
   filter = { $or: [{ title: regex }, { author: regex }] };
   ```
   MongoDB sorts by newest first (`{ createdAt: -1 }`).
3. **Parallel Query Execution**:
   ```javascript
   const skip = (page - 1) * limit;
   const [books, totalItems] = await Promise.all([
     Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
     Book.countDocuments(filter)
   ]);
   const totalPages = Math.ceil(totalItems / limit) || 1;
   ```
4. **Response Payload**:
   ```json
   {
     "success": true,
     "data": [...],
     "page": 1,
     "limit": 5,
     "totalItems": 12,
     "totalPages": 3
   }
   ```

---

## Quickstart / Running Locally

### 1. Start the API Server

```bash
cd server
npm install
# Configure your environment variables if needed
node server.js
```
The server will start on `http://localhost:8800`.
- Health check: `GET http://localhost:8800/` returns `{ "success": true, "message": "MERN Book Catalog API is running" }`.

### 2. Start the React Client

```bash
cd client
npm install
npm run dev
```
The client will start at `http://localhost:5173`. Open in your browser to explore the dashboard.

---

## Deployment Guide

### Database (MongoDB Atlas)
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and configure Network Access (allow `0.0.0.0/0` or the API host IP).
3. Obtain your connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/book-catalog?retryWrites=true&w=majority`.

### API Server (Render)
1. Create a **Web Service** on Render connected to the repository.
2. Root directory: `server`.
3. Build Command: `npm install`.
4. Start Command: `node server.js`.
5. Environment Variables:
   - `PORT`: (Provided by Render, defaults to 8800 locally)
   - `MONGO_URL`: Your Atlas connection string
   - `JWT_SECRET`: A long secure secret key

### Client (Vercel)
1. Create a **New Project** on Vercel connected to the repository.
2. Root directory: `client`.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Environment Variable:
   - `VITE_API_BASE_URL`: The URL of your deployed Render API ending in `/api` (e.g. `https://your-api.onrender.com/api`).

