# Twist Validation Tests: No Duplicate Bike Names

> **SpinCycle Bikes** | Group ST-CSE2D-G03 | Theme 3 of 30

---

## Requirement Overview
- **Rule**: Two bikes cannot share a name, even with different capital letters.
- A duplicate gets HTTP status **`409 Conflict`** and the message: `"Bike 7 already exists"`.
- Validations occur on both **POST** (adding a new bike) and **PUT** (renaming an existing bike).

---

## The 3 Official Twist Tests

| Test | Action | Method & Endpoint | Payload | Expected Status | Expected Body / Message |
|---|---|---|---|---|---|
| **Test 1** | Add Bike 7 | `POST /api/bikes` | `{"name": "Bike 7", "type": "road"}` | **`201 Created`** | Bike 7 created successfully |
| **Test 2** | Add "bike 7" (different casing) | `POST /api/bikes` | `{"name": "bike 7", "type": "hybrid"}` | **`409 Conflict`** | `{"message": "Bike 7 already exists"}` |
| **Test 3** | Rename another bike to "Bike 7" | `PUT /api/bikes/1` | `{"name": "bike 7", "type": "mountain"}` | **`409 Conflict`** | `{"message": "Bike 7 already exists"}` |

---

## Detailed Step-by-Step Execution & Results

### Initial State
- Database seeded with initial bikes:
  - ID 1: `Bike 1` (mountain)
  - ID 2: `Bike 2` (road)
  - ID 3: `Bike 3` (hybrid)
  - ID 4: `Bike 4` (mountain)
  - ID 5: `Bike 5` (road)
  - ID 6: `Bike 6` (electric)

---

### Test 1: Add Bike 7 $\rightarrow$ `201 Created`
- **Request**: `POST /api/bikes`
  ```json
  {
    "name": "Bike 7",
    "type": "road"
  }
  ```
- **Expected Status**: `201 Created`
- **Response**:
  ```json
  {
    "status": "success",
    "message": "Bike created successfully",
    "data": {
      "id": 7,
      "name": "Bike 7",
      "type": "road"
    }
  }
  ```
- **Result**: **PASSED**. Bike 7 is created and stored in the database.

---

### Test 2: Add "bike 7" (lowercase duplicate) $\rightarrow$ `409 Conflict`
- **Request**: `POST /api/bikes`
  ```json
  {
    "name": "bike 7",
    "type": "hybrid"
  }
  ```
- **Expected Status**: `409 Conflict`
- **Response**:
  ```json
  {
    "message": "Bike 7 already exists",
    "error": "Bike 7 already exists"
  }
  ```
- **Result**: **PASSED**. Case-insensitive duplicate check triggers, rejecting the insert with 409 and matching message.

---

### Test 3: Rename another bike to "Bike 7" $\rightarrow$ `409 Conflict`
- **Request**: `PUT /api/bikes/1`
  ```json
  {
    "name": "bike 7",
    "type": "mountain"
  }
  ```
- **Expected Status**: `409 Conflict`
- **Response**:
  ```json
  {
    "message": "Bike 7 already exists",
    "error": "Bike 7 already exists"
  }
  ```
- **Result**: **PASSED**. Rename prevented because "Bike 7" already belongs to ID 7.

---

## Query Search & Validation Checks

### 1. Search by Query Parameter
- **Request**: `GET /api/bikes?type=mountain`
  - Returns only bikes with `type = 'mountain'` (e.g. `Bike 1`, `Bike 4`).
- **Request**: `GET /api/bikes?type=road`
  - Returns only bikes with `type = 'road'` (e.g. `Bike 2`, `Bike 5`).

### 2. Input Validation
- **Missing name or type**: `POST /api/bikes` with `{"name": ""}` $\rightarrow$ `400 Bad Request`
- **Missing rider or bike ID**: `POST /api/rentals` with `{"rider_id": 1}` $\rightarrow$ `400 Bad Request`
- **Non-existent foreign key**: `POST /api/rentals` with `{"rider_id": 999, "bike_id": 1}` $\rightarrow$ `404 Not Found`

### 3. Join Endpoint
- **Request**: `GET /api/rentals/details`
  - Returns rentals joined with rider `name`, `email`, and bike `name`, `type`.
