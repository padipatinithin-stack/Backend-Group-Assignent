# SpinCycle Bikes - Campus Bike Share API

> **Backend Development Fundamentals (BDF)** | Theme 3 of 30: Campus Bike Share | Group ST-CSE2D-G03 (LG-3)  
> 🌐 **Live API URL:** [https://backend-group-assignent.vercel.app](https://backend-group-assignent.vercel.app/)

## Client Brief
> *"Students sign a notebook to take our bikes. Bikes go missing for days and nobody can say who rode them last. Please build us a system that fixes this."*

---

## Team Members & Responsibilities (Group LG-3)

| Branch | Roll No | Team Member | Responsibility |
|---|---|---|---|
| `feature/server-routes` | **252U1R1187** | **Pavan** | Express server setup, middleware, and modular routes (`src/server.js`, `src/routes/`) |
| `feature/database` | **252U1R1184** | **Vinod** | SQLite database connection (`src/config/database.js`), schema (`schema.sql`), and seed data (`seed.sql`) |
| `feature/rest-endpoints` | **252U1R1181** | **Manikanta** | CRUD endpoints for bikes, riders, rentals, and the JOIN endpoint (`src/controllers/`) |
| `feature/validation-search` | **252U1R1168** | **Surya Prakash** | Input validation on add/update, type query search, and error handling |
| `feature/twist-postman-docs` | **252U1R1173** | **Nithin** | "No duplicate names" twist rule enforcement, Postman collection, and documentation |
| `main` | **All** | **All Members** | Final integration, end-to-end verification, and demo preparation |

---

## The Twist Rule: "No Duplicate Names"
- **Rule**: Two bikes cannot share a name, even with different capital letters (case-insensitive check).
- **Duplicate Attempt**: Returns HTTP status **`409 Conflict`** with the message:
  ```json
  {
    "message": "Bike 7 already exists",
    "error": "Bike 7 already exists"
  }
  ```
- **Renaming Protection**: When updating a bike, renaming it to another bike's existing name is also blocked with **`409 Conflict`**.

---

## Project Structure
```
spincycle-bikes/
│
├── src/
│   ├── config/
│   │   └── database.js              # SQLite connection & auto-initialization
│   ├── controllers/
│   │   ├── bikeController.js        # Bike CRUD & type query filter
│   │   ├── riderController.js       # Rider CRUD
│   │   └── rentalController.js      # Rental CRUD & JOIN endpoint
│   ├── middleware/
│   │   └── validation.js            # Input validation & Twist rule logic
│   ├── routes/
│   │   ├── bikeRoutes.js            # /api/bikes routes
│   │   ├── riderRoutes.js           # /api/riders routes
│   │   └── rentalRoutes.js          # /api/rentals routes
│   └── server.js                    # Express application entrypoint
│
├── database/
│   ├── schema.sql                   # Tables: riders, bikes, rentals
│   └── seed.sql                     # Seed records (sample riders, bikes, rentals)
│
├── tests/
│   └── twist-tests.md               # Step-by-step verification of Twist Tests 1-3
│
├── postman/
│   └── spincycle-collection.json    # Complete Postman Collection
│
├── .gitignore
├── package.json
├── package-lock.json
├── test.js                          # Automated test runner (16 tests)
└── README.md
```

---

## Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/padipatinithin-stack/Backend-Group-Assignent.git
cd Backend-Group-Assignent
npm install
```

### 2. Database Initialization
The database initializes and seeds automatically upon first run. To manually run or inspect:
```bash
npm run seed
```

### 3. Run the Server
- Development mode (with auto-reload):
  ```bash
  npm run dev
  ```
- Normal mode:
  ```bash
  npm start
  ```
The API is available at: `http://localhost:3000`

### 4. Live Deployment (Vercel)
The API is deployed live on Vercel:
- **Base URL:** [https://backend-group-assignent.vercel.app](https://backend-group-assignent.vercel.app/)
- **Bikes Endpoint:** [https://backend-group-assignent.vercel.app/api/bikes](https://backend-group-assignent.vercel.app/api/bikes)
- **Riders Endpoint:** [https://backend-group-assignent.vercel.app/api/riders](https://backend-group-assignent.vercel.app/api/riders)
- **Rentals Endpoint:** [https://backend-group-assignent.vercel.app/api/rentals](https://backend-group-assignent.vercel.app/api/rentals)
- **Join Details Endpoint:** [https://backend-group-assignent.vercel.app/api/rentals/details](https://backend-group-assignent.vercel.app/api/rentals/details)

#### How Deployment Works on Vercel:
- Configured via `vercel.json` with rewrites pointing to `/api/index.js` (Serverless handler wrapping Express).
- Automatic deployments trigger on every `git push` to `main`.
- SQLite database runs in `os.tmpdir()` to support serverless read/write execution.

---

## Postman Collection

Import `postman/spincycle-collection.json` into Postman.
- Environment variable `baseUrl` is pre-configured to `http://localhost:3000`.
- The collection contains pre-configured requests for:
  - **Bikes**: Get all, search by type (`?type=`), get by ID, create, update, delete.
  - **Riders**: Get all, get by ID, create, update, delete.
  - **Rentals & JOIN**: Get all, get details with rider name and bike name, get one, create, update, delete.
  - **Twist Tests**: Complete automated flow for Test 1, Test 2, and Test 3.

---

## API Endpoints Reference

### 1. Bikes (`/api/bikes`)
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/bikes` | Get all bikes (supports `?type=<type>` query param) | `200 OK` |
| `GET` | `/api/bikes/:id` | Get bike by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/bikes` | Add a new bike (body: `name`, `type`) | `201 Created` / `400 Bad Request` / `409 Conflict` |
| `PUT` | `/api/bikes/:id` | Update bike by ID (body: `name`, `type`) | `200 OK` / `400 Bad Request` / `404 Not Found` / `409 Conflict` |
| `DELETE` | `/api/bikes/:id` | Delete bike by ID | `200 OK` / `404 Not Found` |

### 2. Riders (`/api/riders`)
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/riders` | Get all registered riders | `200 OK` |
| `GET` | `/api/riders/:id` | Get rider by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/riders` | Register a new rider (body: `name`, `email`) | `201 Created` / `400 Bad Request` / `409 Conflict` |
| `PUT` | `/api/riders/:id` | Update rider by ID (body: `name`, `email`) | `200 OK` / `400 Bad Request` / `404 Not Found` / `409 Conflict` |
| `DELETE` | `/api/riders/:id` | Delete rider by ID | `200 OK` / `404 Not Found` |

### 3. Rentals & JOIN Endpoint (`/api/rentals`)
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/rentals` | Get all rentals | `200 OK` |
| `GET` | `/api/rentals/details` | **JOIN Endpoint**: rentals with rider name and bike name | `200 OK` |
| `GET` | `/api/rentals/:id` | Get rental by ID | `200 OK` / `404 Not Found` |
| `POST` | `/api/rentals` | Create rental (body: `rider_id`, `bike_id`) | `201 Created` / `400 Bad Request` / `404 Not Found` |
| `PUT` | `/api/rentals/:id` | Update rental (e.g. mark `returned_at`) | `200 OK` / `400 Bad Request` / `404 Not Found` |
| `DELETE` | `/api/rentals/:id` | Delete rental by ID | `200 OK` / `404 Not Found` |

---

## Testing the Twist Rule ("No duplicate names")

Refer to [`tests/twist-tests.md`](./tests/twist-tests.md) for full documentation.

- **Test 1**: Add Bike 7:
  - Request: `POST /api/bikes` with `{"name": "Bike 7", "type": "road"}`
  - **Result**: `201 Created`
- **Test 2**: Add "bike 7" (different casing):
  - Request: `POST /api/bikes` with `{"name": "bike 7", "type": "hybrid"}`
  - **Result**: `409 Conflict` with `{"message": "Bike 7 already exists"}`
- **Test 3**: Rename another bike to the same name:
  - Request: `PUT /api/bikes/1` with `{"name": "bike 7", "type": "mountain"}`
  - **Result**: `409 Conflict` with `{"message": "Bike 7 already exists"}`
