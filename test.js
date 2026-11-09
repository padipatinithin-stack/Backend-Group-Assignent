const http = require("http");
const app = require("./server");

const PORT = 3001;
const server = app.listen(PORT, async () => {
  console.log(`Test server running on port ${PORT}`);

  function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "localhost",
        port: PORT,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      const req = http.request(options, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(body);
          } catch {
            json = body;
          }
          resolve({ status: res.statusCode, body: json });
        });
      });

      req.on("error", reject);
      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log("\n--- Testing Root & Info ---");
    let res = await request("GET", "/");
    assert(res.status === 200, "Root returns 200");

    console.log("\n--- Testing Bikes CRUD & Search ---");
    res = await request("GET", "/bikes");
    assert(res.status === 200 && Array.isArray(res.body), "GET /bikes returns array");

    res = await request("GET", "/bikes?type=mountain");
    assert(
      res.status === 200 && res.body.every((b) => b.type.toLowerCase() === "mountain"),
      "GET /bikes?type=mountain filters by type"
    );

    console.log("\n--- Testing YOUR TWIST (No duplicate bike names) ---");
    // Test 1: Add Bike 7 -> 201
    res = await request("POST", "/bikes", { name: "Bike 7", type: "road" });
    assert(res.status === 201, "Test 1: Add Bike 7 -> 201");
    assert(res.body.name === "Bike 7", "Bike 7 created with correct name");
    const bike7Id = res.body.id;

    // Test 2: Add "bike 7" -> 409
    res = await request("POST", "/bikes", { name: "bike 7", type: "hybrid" });
    assert(res.status === 409, "Test 2: Add 'bike 7' -> 409");
    assert(
      res.body.error === "Bike 7 already exists",
      `Test 2 error message matches exactly: "${res.body.error}"`
    );

    // Test 3: Rename another bike to the same name -> 409
    res = await request("PUT", "/bikes/1", { name: "bike 7", type: "mountain" });
    assert(res.status === 409, "Test 3: Rename another bike to 'bike 7' -> 409");
    assert(
      res.body.error === "Bike 7 already exists",
      `Test 3 error message matches exactly: "${res.body.error}"`
    );

    console.log("\n--- Testing Validation ---");
    res = await request("POST", "/bikes", { name: "", type: "road" });
    assert(res.status === 400, "POST /bikes with empty name returns 400");

    res = await request("POST", "/bikes", { type: "road" });
    assert(res.status === 400, "POST /bikes without name returns 400");

    console.log("\n--- Testing JOIN Endpoint ---");
    res = await request("GET", "/rentals/details/all");
    assert(res.status === 200 && Array.isArray(res.body), "GET /rentals/details/all returns array");
    if (res.body.length > 0) {
      assert(
        res.body[0].rider_name !== undefined && res.body[0].bike_name !== undefined,
        "JOIN endpoint contains rider_name and bike_name"
      );
    }

    console.log("\n--- Testing Rentals CRUD ---");
    res = await request("POST", "/rentals", { rider_id: 1, bike_id: 2 });
    assert(res.status === 201, "POST /rentals creates rental (201)");
    const rentalId = res.body.id;

    res = await request("PUT", `/rentals/${rentalId}`, {
      rider_id: 1,
      bike_id: 2,
      returned_at: "2026-11-09 12:00:00",
    });
    assert(res.status === 200, "PUT /rentals/:id updates rental (200)");

    res = await request("DELETE", `/rentals/${rentalId}`);
    assert(res.status === 200, "DELETE /rentals/:id deletes rental (200)");

    // Clean up Bike 7
    await request("DELETE", `/bikes/${bike7Id}`);

    console.log(`\n========================================`);
    console.log(`Summary: ${passed} passed, ${failed} failed`);
    console.log(`========================================\n`);
  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
});
