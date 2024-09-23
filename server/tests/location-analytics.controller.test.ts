import { setupServer } from "../app";
import { TaskStatus } from "../controllers/controller-helpers";
import { costByLocation } from "../controllers/location-analytics.controller";

/*
  Tests assume that the database is seeded with the docker-compose run migrate
*/

beforeAll(async () => {
  await setupServer();
});

describe("costByLocation should filter by task statuses correctly", () => {
  it("should return correct data for all locations with both complete and incomplete tasks", async () => {
    const result = await costByLocation(TaskStatus.BOTH);

    expect(result.data.totalCost).toBe(905);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(905);
    expect(result.data.breakdown.length).toBe(5);
  });

  it("should return correct data for all locations with complete tasks", async () => {
    const result = await costByLocation(TaskStatus.COMPLETE);

    expect(result.data.totalCost).toBe(592.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(592.5);
    expect(result.data.breakdown.length).toBe(4);
  });

  it("should return correct data for all locations with incomplete tasks", async () => {
    const result = await costByLocation(TaskStatus.INCOMPLETE);

    expect(result.data.totalCost).toBe(312.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(312.5);
    expect(result.data.breakdown.length).toBe(3);
  });
});

describe("costByLocation should filter by locations correctly", () => {
  it("should return correct data for all locations if no locationIds specified", async () => {
    const result = await costByLocation(TaskStatus.BOTH);

    expect(result.data.totalCost).toBe(905);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(905);
    expect(result.data.breakdown.length).toBe(5);
  });

  it("should return correct data for all locations if empty locationId array", async () => {
    const result = await costByLocation(TaskStatus.BOTH, []);

    expect(result.data.totalCost).toBe(905);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(905);
    expect(result.data.breakdown.length).toBe(5);
  });

  it("should return correct data for locationId=1", async () => {
    const result = await costByLocation(TaskStatus.BOTH, [1]);

    expect(result.data.totalCost).toBe(197.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(197.5);
    expect(result.data.breakdown.length).toBe(1);
  });

  it("should return correct data for locationId=1,2,3", async () => {
    const result = await costByLocation(TaskStatus.COMPLETE, [1, 2, 3]);

    expect(result.data.totalCost).toBe(372.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(372.5);
    expect(result.data.breakdown.length).toBe(2);
  });

  it("should ignore invalid locationIds", async () => {
    const result = await costByLocation(TaskStatus.COMPLETE, [8948]);

    expect(result.data.totalCost).toBe(0);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(0);
    expect(result.data.breakdown.length).toBe(0);
  });

  it("should ignore invalid locationIds with valid locationIds", async () => {
    const result = await costByLocation(TaskStatus.BOTH, [1, 2, 3, 8948]);

    expect(result.data.totalCost).toBe(462.5);
    expect(
      result.data.breakdown.reduce((acc, curr) => acc + curr.totalCost, 0)
    ).toBe(462.5);
    expect(result.data.breakdown.length).toBe(3);
  });
});
