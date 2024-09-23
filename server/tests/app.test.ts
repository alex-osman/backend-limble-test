import request from "supertest";
import { setupServer } from "../app";
import AppDataSource from "../db";

describe("GET /", () => {
  let app;

  // Set up DB connection and express app
  beforeAll(async () => {
    app = await setupServer();
  });

  // Tear down DB connection after all tests
  afterAll(async () => {
    await AppDataSource.destroy();
  });

  // Test case for GET /
  it('should return 200 and "Hello!"', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Hello!");
  });
});
