import { setupServer } from "../app";
import { TaskStatus } from "../controllers/controller-helpers";
import { costByWorker } from "../controllers/worker-analytics.controller";

beforeAll(async () => {
  await setupServer();
});

describe("costByWorker Function", () => {
  it("should return correct data for all workers if no workerIds specified", async () => {
    const result = await costByWorker(TaskStatus.BOTH);
    console.log("result - ", result);

    expect(result.status).toBe("success");
    expect(result.data.breakdown.length).toBe(3);
  });
});
