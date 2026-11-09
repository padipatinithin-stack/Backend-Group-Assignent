# 🚲 SpinCycle Bikes — Campus Bike Share API

> *"Students sign a notebook to take our bikes. Bikes go missing for days and nobody can say who rode them last. Please build us a system that fixes this."*

**BDF Group Assignment · ST-CSE2D-G03 · Group 3**

---

## 📋 Overview

SpinCycle Bikes is a REST API built with **Express.js** and **SQLite** that manages a campus bike-sharing system. It tracks riders, bikes, and rentals so you always know who has which bike.

## 🛠 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite (via better-sqlite3)

## 🚀 How to Run

### 1. Clone the repository
```bash
git clone https://github.com/padipatinithin-stack/Backend-Group-Assignent.git
cd Backend-Group-Assignent
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the server
```bash
npm start
```

The API will be running at **http://localhost:3000**

### 4. Development mode (auto-restart on file changes)
```bash
npm run dev
```

---

## 📁 Project Structure

```
SpinCycle-Bikes/
├── server.js              # Main entry point — Express app
├── package.json           # Dependencies and scripts
├── db/
│   └── database.js        # SQLite setup, tables, and seed data
├── routes/
│   ├── riders.js          # CRUD routes for riders
│   ├── bikes.js           # CRUD routes for bikes (with twist)
│   └── rentals.js         # CRUD routes for rentals + JOIN endpoint
├── .gitignore
└── README.md
```

---

## 🗄 Database Schema

### riders
| Column | Type    | Constraints          |
|--------|---------|----------------------|
| id     | INTEGER | PRIMARY KEY, AUTO    |
| name   | TEXT    | NOT NULL             |
| email  | TEXT    | NOT NULL, UNIQUE     |

### bikes
| Column | Type    | Constraints          |
|--------|---------|----------------------|
| id     | INTEGER | PRIMARY KEY, AUTO    |
| name   | TEXT    | NOT NULL             |
| type   | TEXT    | NOT NULL             |

### rentals
| Column      | Type    | Constraints                  |
|-------------|---------|------------------------------|
| id          | INTEGER | PRIMARY KEY, AUTO            |
| rider_id    | INTEGER | FK → riders.id               |
| bike_id     | INTEGER | FK → bikes.id                |
| rented_at   | TEXT    | DEFAULT current timestamp    |
| returned_at | TEXT    | nullable                     |

---

## 📡 API Endpoints

### Riders `/riders`
| Method | Route        | Description         | Status Codes  |
|--------|--------------|---------------------|---------------|
| GET    | /riders      | Get all riders      | 200           |
| GET    | /riders/:id  | Get one rider       | 200 / 404     |
| POST   | /riders      | Add a new rider     | 201 / 400 / 409 |
| PUT    | /riders/:id  | Update a rider      | 200 / 400 / 404 / 409 |
| DELETE | /riders/:id  | Delete a rider      | 200 / 404     |

### Bikes `/bikes`
| Method | Route        | Description         | Status Codes  |
|--------|--------------|---------------------|---------------|
| GET    | /bikes       | Get all bikes       | 200           |
| GET    | /bikes?type= | Search bikes by type| 200           |
| GET    | /bikes/:id   | Get one bike        | 200 / 404     |
| POST   | /bikes       | Add a new bike      | 201 / 400 / 409 |
| PUT    | /bikes/:id   | Update a bike       | 200 / 400 / 404 / 409 |
| DELETE | /bikes/:id   | Delete a bike       | 200 / 404     |

### Rentals `/rentals`
| Method | Route                | Description                          | Status Codes  |
|--------|----------------------|--------------------------------------|---------------|
| GET    | /rentals             | Get all rentals                      | 200           |
| GET    | /rentals/:id         | Get one rental                       | 200 / 404     |
| POST   | /rentals             | Add a new rental                     | 201 / 400 / 404 |
| PUT    | /rentals/:id         | Update a rental                      | 200 / 400 / 404 |
| DELETE | /rentals/:id         | Delete a rental                      | 200 / 404     |
| GET    | /rentals/details/all | **JOIN** — rentals + rider + bike names | 200         |

---

## 🔀 Twist: No Duplicate Bike Names

Two bikes **cannot** share a name, even with different capitalisation (case-insensitive check).

| Test | Action                              | Expected |
|------|-------------------------------------|----------|
| 1    | Add "Bike 7"                        | **201** Created |
| 2    | Add "bike 7" (different case)       | **409** `{ "error": "Bike 7 already exists" }` |
| 3    | Rename another bike to "Bike 7"     | **409** `{ "error": "Bike 7 already exists" }` |

---

## 🔍 Search

Search bikes by type using a query parameter:

```
GET /bikes?type=mountain
```

Returns all bikes of that type (case-insensitive match).

---

## 🧪 Testing with Postman

1. Import the `SpinCycleBikes.postman_collection.json` file into Postman.
2. Make sure the server is running (`npm start`).
3. Run the collection — tests are included for all endpoints and the twist.

---

## 👥 Team — Group 3, CSE2D

| Part | Responsibility                    |
|------|-----------------------------------|
| 1    | Server and routes                 |
| 2    | Database (tables + queries)       |
| 3    | REST endpoints (CRUD + join)      |
| 4    | Validation and search             |
| 5    | Twist rule                        |
| 6    | Postman collection and README     |

---

## 📜 License

ISC
