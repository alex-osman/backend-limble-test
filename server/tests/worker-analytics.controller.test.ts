import { setupServer } from "../app";
import { TaskStatus } from "../controllers/controller-helpers";
import { costByWorker } from "../controllers/worker-analytics.controller";

/*
  Tests assume that the database is seeded with the docker-compose run migrate
*/

beforeAll(async () => {
  await setupServer();
});

describe("costByWorker should filter by task statuses correctly", () => {
  it("should return correct data for all workers with both complete and incomplete tasks", async () => {
    const result = await costByWorker(TaskStatus.BOTH);

    expect(result.data.totalCost).toBe(905);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(905);
    expect(result.data.breakdown.length).toBe(5);
  });

  it("should return correct data for all workers with complete tasks", async () => {
    const result = await costByWorker(TaskStatus.COMPLETE);

    expect(result.data.totalCost).toBe(592.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(592.5);
    expect(result.data.breakdown.length).toBe(5);
  });

  it("should return correct data for all workers with incomplete tasks", async () => {
    const result = await costByWorker(TaskStatus.INCOMPLETE);

    expect(result.data.totalCost).toBe(312.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(312.5);
    expect(result.data.breakdown.length).toBe(3);
  });
});

describe("costByWorker should filter by workers correctly", () => {
  it("should return correct data for all workers if no workerIds specified", async () => {
    const result = await costByWorker(TaskStatus.BOTH);

    expect(result.data.totalCost).toBe(905);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(905);
    expect(result.data.breakdown.length).toBe(5);
  });

  it("should return correct data for all workers if empty workerId array", async () => {
    const result = await costByWorker(TaskStatus.BOTH, []);

    expect(result.data.totalCost).toBe(905);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(905);
    expect(result.data.breakdown.length).toBe(5);
  });

  it("should return correct data for workerid=1", async () => {
    const result = await costByWorker(TaskStatus.BOTH, [1]);

    expect(result.data.totalCost).toBe(150);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(150);
    expect(result.data.breakdown.length).toBe(1);
  });

  it("should return correct data for workerid=1,2,3", async () => {
    const result = await costByWorker(TaskStatus.COMPLETE, [1, 2, 3]);

    expect(result.data.totalCost).toBe(372.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(372.5);
    expect(result.data.breakdown.length).toBe(3);
  });

  it("should ignore invalid workerids", async () => {
    const result = await costByWorker(TaskStatus.COMPLETE, [8948]);

    expect(result.data.totalCost).toBe(0);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(0);
    expect(result.data.breakdown.length).toBe(0);
  });

  it("should ignore invalid workerids with valid workerIds", async () => {
    const result = await costByWorker(TaskStatus.BOTH, [1, 2, 3, 8948]);

    expect(result.data.totalCost).toBe(462.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(462.5);
    expect(result.data.breakdown.length).toBe(3);
  });
});
