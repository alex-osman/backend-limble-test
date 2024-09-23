import { costByWorker, TaskStatus } from "../controllers/analytics.controller";
import AppDataSource from "../db";
import { Worker } from "../entities/worker.entity";

describe("costByWorker Function", () => {
  // it("should return correct data for all workers if no workerIds specified", async () => {
  //   // Mocking the result of this function, replacing with your own test logic later
  //   const result = await costByWorker(TaskStatus.BOTH);
  //   console.log("result - ", result);

  //   expect(result.status).toBe("success");
  // });

  it("should access the database just fine", async () => {
    const workers = await AppDataSource.getRepository(Worker).find();
    console.log("workers - ", workers);
    expect(workers.length).toBeGreaterThan(0);
  })
});
