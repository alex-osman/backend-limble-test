import request from "supertest";
import { setupServer } from "./app";
import * as mariadb from "mariadb";

describe("GET /", () => {
  let app;
  let db: mariadb.Pool;

  // Set up DB connection and express app
  beforeAll(async () => {
    ({ app, db } = await setupServer());
  });

  // Tear down DB connection after all tests
  afterAll(async () => {
    await db.end();
  });

  // Test case for GET /
  it('should return 200 and "Hello!"', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello!");
  });
});
