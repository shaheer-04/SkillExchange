# Peshawar Micro-Skill Exchange (SkillExchange)

A peer-to-peer **skill bartering** platform for university students and young adults in
Peshawar. Students list skills they can teach and skills they want to learn, discover each
other, and send skill-swap requests. **No money is exchanged — only knowledge.**

> Example
> Ahmad offers *Python, Git and GitHub* and wants to learn *Spoken English*.
> Hira offers *Spoken English* and wants to learn *Python*.
> They find each other on SkillExchange and agree on a time, a place and a mode.

---

## Table of contents

1. [Features](#features)
2. [Technology stack](#technology-stack)
3. [System architecture](#system-architecture)
4. [Folder structure](#folder-structure)
5. [Installation](#installation)
6. [Environment variables](#environment-variables)
7. [MongoDB Atlas setup](#mongodb-atlas-setup)
8. [Running the backend](#running-the-backend)
9. [Running the frontend](#running-the-frontend)
10. [Seed data and test accounts](#seed-data-and-test-accounts)
11. [API overview](#api-overview)
12. [Testing](#testing)
13. [Production build](#production-build)
14. [Deployment](#deployment)
15. [GitHub instructions](#github-instructions)
16. [Security notes](#security-notes)

---

## Features

**Accounts and authentication**

- Registration with name, email, password, institution and contact information
- Passwords hashed with bcryptjs — plain text is never stored
- JWT login, token kept in the browser, session restored on reload
- Protected pages: Dashboard, Profile, Create Listing, Edit Listing, My Listings, Swap Requests
- Logout that clears the token and blocks the private pages again

**Profile**

- View and edit name, institution, bio (max 250 chars), contact info
- Skills to offer / skills to learn, entered as a comma separated list
- A user can only ever read or modify their own profile

**Skill listings**

- Create, read, update and delete listings
- Fields: title, description, category, type (Offer / Request), mode (In-Person / Online / Both), status (Active / Closed)
- Ownership checks: only the owner can edit, close or delete a listing
- Deleting a listing also removes the swap requests attached to it

**Discovery**

- Explore Skills marketplace with live data from MongoDB
- Text search across title, description and category
- Category, Type and Mode filters that can be combined
- Clear filters, shareable URLs (`/explore?search=python&category=Programming`)
- Listing details page with the owner's institution, bio and skills

**Swap requests**

- Send a request with a message, preferred time, meeting mode and location
- Location is required when the meeting is In-Person
- A student cannot request their own listing
- Duplicate **pending** requests for the same listing are blocked
- Incoming / Outgoing dashboard with Accept and Reject
- Only the receiver can accept or reject; an answered request cannot be changed again
- Contact details are revealed only after a request is **Accepted**

**Interface**

- Dashboard with statistics, recent listings, recent swaps and quick actions
- Loading indicators, error messages and empty states everywhere
- Client-side and server-side validation on every form
- Responsive layout tested at 320px, 390px, 768px and 1024px+, with a mobile menu
- Custom CSS only — no UI framework

---

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Axios, Context API, plain CSS |
| Backend | Node.js, Express 4, Mongoose 8 |
| Database | MongoDB (MongoDB Atlas in production) |
| Auth | JSON Web Tokens (jsonwebtoken), bcryptjs |
| Other | cors, dotenv, nodemon (dev) |

Redux is deliberately **not** used — the Context API is enough for this application.

---

## System architecture

```
┌──────────────────────────── Browser ────────────────────────────┐
│  React (Vite)                                                   │
│    pages/  components/  context/AuthContext  services/api.js    │
└───────────────────────────┬─────────────────────────────────────┘
                            │  HTTPS / JSON
                            │  Authorization: Bearer <JWT>
┌───────────────────────────▼─────────────────────────────────────┐
│  Express API (server.js)                                        │
│    routes/  →  middleware/  →  controllers/  →  models/         │
└───────────────────────────┬─────────────────────────────────────┘
                            │  Mongoose
┌───────────────────────────▼─────────────────────────────────────┐
│  MongoDB  ·  users · skilllistings · swaprequests               │
└─────────────────────────────────────────────────────────────────┘
```

Request path for a protected endpoint:

```
Request → CORS → express.json → route → protect (JWT) → controller → model → MongoDB
                                                                    ↓
                                             JSON response ← populated documents
```

**Data relationships**

- `SkillListing.user` → `User`
- `SwapRequest.listing` → `SkillListing`
- `SwapRequest.sender` → `User`
- `SwapRequest.receiver` → `User`

`.populate()` is always called with an explicit field list, so a password can never be
returned by any endpoint.

---

## Folder structure

```
SkillExchange/
├── client/                       React + Vite frontend
│   ├── public/favicon.svg
│   ├── src/
│   │   ├── components/           Navbar, Footer, ProtectedRoute, SkillCard,
│   │   │                         SearchBar, FilterBar, ListingForm,
│   │   │                         SwapRequestForm, SwapRequestCard,
│   │   │                         Loading, ErrorMessage
│   │   ├── pages/                Home, Login, Register, Dashboard,
│   │   │                         ExploreSkills, ListingDetails, CreateListing,
│   │   │                         EditListing, MyListings, SwapRequests,
│   │   │                         Profile, NotFound
│   │   ├── context/AuthContext.jsx
│   │   ├── services/api.js       one Axios instance + all API helpers
│   │   ├── constants.js          shared option lists
│   │   ├── App.jsx               routing only
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                       Express + MongoDB backend
│   ├── config/db.js              MongoDB connection
│   ├── config/constants.js       enums shared by models and controllers
│   ├── controllers/              authController, userController,
│   │                             listingController, swapController
│   ├── middleware/               authMiddleware (JWT), errorMiddleware
│   ├── models/                   User, SkillListing, SwapRequest
│   ├── routes/                   authRoutes, userRoutes, listingRoutes, swapRoutes
│   ├── utils/                    asyncHandler, generateToken
│   ├── tests/api.test.js         automated API test suite
│   ├── seed.js                   optional sample data
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Installation

You need **Node.js 18 or newer** and a MongoDB database (MongoDB Atlas free tier is fine).

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd SkillExchange

# backend
cd server
npm install

# frontend (second terminal, or after the backend install finishes)
cd ../client
npm install
```

---

## Environment variables

### `server/.env`

Copy `server/.env.example` to `server/.env`:

```bash
cd server
cp .env.example .env        # Windows: copy .env.example .env
```

| Variable | Meaning | Example |
|---|---|---|
| `PORT` | Port the API listens on | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/skillexchange?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret used to sign tokens | a long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed CORS origin(s), comma separated. Empty = allow all (development only) | `http://localhost:5173` |
| `NODE_ENV` | `development` or `production` | `development` |

Generate a strong secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### `client/.env`

```bash
cd client
cp .env.example .env
```

| Variable | Meaning | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

Vite only exposes variables that begin with `VITE_`.

---

## MongoDB Atlas setup

1. Create a free account at <https://www.mongodb.com/cloud/atlas/register>.
2. Create a **free M0 cluster** (any provider / region).
3. **Database Access → Add New Database User**: create a username and password.
   Use letters and numbers only, or URL-encode special characters.
4. **Network Access → Add IP Address → Allow access from anywhere (`0.0.0.0/0`)**.
   This is required so a deployed backend can reach the database.
5. **Database → Connect → Drivers → Node.js** and copy the connection string.
6. Replace `<password>` with your real password and put the database name
   (`skillexchange`) before the `?`:

```
mongodb+srv://myuser:MyPass123@cluster0.abcde.mongodb.net/skillexchange?retryWrites=true&w=majority
```

7. Paste it into `server/.env` as `MONGO_URI`.

A local MongoDB also works: `MONGO_URI=mongodb://127.0.0.1:27017/skillexchange`

---

## Running the backend

The frontend and the backend run in **two separate terminals**.

```bash
# terminal 1
cd server
npm run dev      # nodemon, restarts on every change
# or
npm start        # plain node
```

Expected output:

```
MongoDB connected: cluster0-shard-00-01.abcde.mongodb.net/skillexchange
SkillExchange API running on http://localhost:5000
```

Quick check: <http://localhost:5000/api/health>

---

## Running the frontend

```bash
# terminal 2
cd client
npm run dev
```

Open <http://localhost:5173>.

Other scripts:

```bash
npm run build      # production build into client/dist
npm run preview    # serve the production build locally
```

---

## Seed data and test accounts

The application works perfectly with an **empty database**. The seed script only makes it
nicer to demonstrate.

```bash
cd server
npm run seed
```

It clears the three collections and inserts 5 students, 10 listings and 2 swap requests.

| Email | Institution | Password |
|---|---|---|
| ahmad@uetpeshawar.edu.pk | UET Peshawar | `Password123` |
| hira@uop.edu.pk | University of Peshawar | `Password123` |
| bilal@icp.edu.pk | Islamia College | `Password123` |
| sana@imsciences.edu.pk | IMSciences | `Password123` |
| usman@uetpeshawar.edu.pk | UET Peshawar | `Password123` |

> These are development accounts. Never use them on a public deployment.

---

## API overview

Base URL: `http://localhost:5000/api`
Private endpoints require the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Create an account, returns `{ token, user }` |
| POST | `/auth/login` | Public | Log in, returns `{ token, user }` |
| GET | `/auth/me` | Private | Current user (used to restore the session) |

### Users

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/users/profile` | Private | Own profile |
| PUT | `/users/profile` | Private | Update own profile |

### Listings

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/listings` | Public | Active listings, supports `search`, `category`, `type`, `mode` |
| GET | `/listings/my` | Private | Every listing of the logged-in user |
| GET | `/listings/:id` | Public | One listing with its owner |
| POST | `/listings` | Private | Create |
| PUT | `/listings/:id` | Owner | Update |
| DELETE | `/listings/:id` | Owner | Delete |

Examples:

```
GET /api/listings?search=python
GET /api/listings?category=Programming
GET /api/listings?type=Offer&mode=Online
GET /api/listings?search=react&category=Web%20Dev&type=Offer&mode=Both
```

### Swaps

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/swaps` | Private | Send a swap request |
| GET | `/swaps/my-requests` | Private | `{ incoming, outgoing }` |
| PUT | `/swaps/:id` | Receiver | `{ "status": "Accepted" \| "Rejected" }` |

### Status codes used

`200` OK · `201` Created · `400` Bad Request (validation) · `401` Unauthorized
(missing/invalid token, wrong credentials) · `403` Forbidden (not the owner / not the
receiver) · `404` Not Found · `409` Conflict (duplicate email, duplicate pending request)
· `500` Internal Server Error.

---

## Testing

### Automated API tests

```bash
cd server
npm test
```

The suite starts the Express app, connects to `<your database>_test`, and runs 77
assertions covering registration, hashing, login, JWT protection, profile update, listing
CRUD, ownership rules, search and every filter, swap requests, duplicate prevention,
accept/reject authorization and cascade deletion.

### Manual workflow to demonstrate

1. Open the app → Home → Explore Skills (listings load from MongoDB)
2. Search "python", filter by category / type / mode, clear filters
3. Register → you land on the Dashboard
4. Profile → complete your skills → Save
5. Create Listing → you are taken to the listing details page
6. My Listings → Edit → Save
7. Log out, register a second student
8. Open the first student's listing → Request Skill Swap → fill the form → send
9. Send the same request again → the duplicate is blocked
10. Log in as the first student → Swap Requests → Incoming → Accept
11. Log in as the second student → Outgoing shows **Accepted** and the contact details
12. Try `/dashboard` after logging out → you are redirected to `/login`

---

## Production build

```bash
cd client
npm run build
```

The build output is written to `client/dist`. Preview it locally with `npm run preview`.

---

## Deployment

### Frontend on Vercel

1. Push the project to GitHub.
2. Vercel → **Add New… → Project** → import the repository.
3. **Root Directory:** `client`
4. Framework preset: **Vite** (build command `npm run build`, output `dist`).
5. Environment variable:

   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-backend-domain>/api` |

6. Deploy.

### Backend on a Node host (Render, Railway, Cyclic, …)

1. Create a **Web Service** from the same repository.
2. **Root Directory:** `server`
3. Build command: `npm install` · Start command: `npm start`
4. Environment variables:

   | Name | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | `https://<your-frontend-domain>` |
   | `NODE_ENV` | `production` |

5. In MongoDB Atlas → Network Access, allow `0.0.0.0/0`.
6. After both are live, set `VITE_API_URL` on Vercel to the backend URL and redeploy the
   frontend.

Nothing in the code hardcodes `localhost`, database credentials or the JWT secret — all of
it comes from environment variables.

---

## GitHub instructions

```bash
cd SkillExchange
git init
git add .
git commit -m "Peshawar Micro-Skill Exchange (SkillExchange) - MERN project"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Before pushing, confirm no secrets are included:

```bash
git status --short              # server/.env and client/.env must NOT appear
git check-ignore -v server/.env # should print the .gitignore rule
```

---

## Security notes

1. Passwords hashed with bcryptjs (10 salt rounds) in a Mongoose `pre('save')` hook.
2. `password` has `select: false` and is stripped again in `toJSON()` — it is never
   returned by any endpoint.
3. JWT verified on every private request by `middleware/authMiddleware.js`.
4. Ownership checks on update / delete of listings and on accept / reject of swaps.
5. `sender` comes from the token and `receiver` from the listing — never from the request
   body, so identities cannot be forged.
6. All input validated on the server as well as in the browser.
7. Contact details are only revealed after a swap request is accepted.
8. Login errors are generic, so registered emails cannot be discovered.
9. Secrets live in `.env`, which is listed in `.gitignore`; `.env.example` holds names only.
10. Stack traces are hidden when `NODE_ENV=production`.
11. CORS is restricted through `CLIENT_URL` in production.
