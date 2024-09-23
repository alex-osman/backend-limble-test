import request from "supertest";
import { setupServer } from "../app";
import AppDataSource from "../db";

describe("API Endpoints", () => {
  let app;

  // Set up DB connection and express app
  beforeAll(async () => {
    app = await setupServer();
  });

  // Tear down DB connection after all tests
  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe("200 on valid routes", () => {
    it("should return 200 for /analytics/by-worker", async () => {
      const response = await request(app).get("/analytics/by-worker");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Analytics by worker");
    });
    
    it("should return 200 for /analytics/by-location", async () => {
      const response = await request(app).get("/analytics/by-location");
      expect(response.status).toBe(200);
      expect(response.text).toBe("Analytics by location");
    });
  });

  describe("404 on invalid routes", () => {
    it("should return 404 for /", async () => {
      const response = await request(app).get("/");
      expect(response.status).toBe(404);
      expect(response.text).toBe("Not found");
    });
    
    it("should return 404 for /home", async () => {
      const response = await request(app).get("/home");
      expect(response.status).toBe(404);
      expect(response.text).toBe("Not found");
    });
    
    it("should return 404 for /analytics", async () => {
      const response = await request(app).get("/analytics");
      expect(response.status).toBe(404);
      expect(response.text).toBe("Not found");
    });
  });
});
