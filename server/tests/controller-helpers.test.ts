import { Request } from "express";
import {
  getAnalyticQueryParams,
  TaskStatus,
} from "../controllers/controller-helpers";

describe("validateTaskStatus", () => {
  it("should return COMPLETE for 'complete'", () => {
    const req = { query: { taskStatus: "complete" } } as unknown as Request;
    const result = getAnalyticQueryParams(req);
    expect(result.taskStatus).toBe(TaskStatus.COMPLETE);
  });

  it("should return INCOMPLETE for 'incomplete'", () => {
    const req = { query: { taskStatus: "incomplete" } } as unknown as Request;
    const result = getAnalyticQueryParams(req);
    expect(result.taskStatus).toBe(TaskStatus.INCOMPLETE);
  });

  it("should return BOTH for 'both'", () => {
    const req = { query: { taskStatus: "both" } } as unknown as Request;
    const result = getAnalyticQueryParams(req);
    expect(result.taskStatus).toBe(TaskStatus.BOTH);
  });

  it("should throw an error when taskStatus is missing", () => {
    const req = { query: {} } as unknown as Request;

    try {
      getAnalyticQueryParams(req);
      fail("Expected an error to be thrown, but none was thrown.");
    } catch (e) {
      expect(e.status).toBe("error");
      expect(e.message).toBe("Validation failed");
      expect(e.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "The 'taskStatus' query parameter is required.",
          }),
        ])
      );
    }
  });

  it("should throw an error for an invalid taskStatus", () => {
    const req = { query: { taskStatus: "invalid" } } as unknown as Request;
    try {
      getAnalyticQueryParams(req);
      fail("Expected an error to be thrown, but none was thrown.");
    } catch (e) {
      expect(e.status).toBe("error");
      expect(e.message).toBe("Validation failed");
      expect(e.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message:
              "The 'taskStatus' query parameter must be one of 'COMPLETE', 'INCOMPLETE', or 'BOTH'.",
          }),
        ])
      );
    }
  });
});

describe("validateObjectIds", () => {
  it("should return an empty array when workerIds is undefined", () => {
    const req = { query: { taskStatus: "COMPLETE" } } as unknown as Request;
    const result = getAnalyticQueryParams(req);
    expect(result.workerIds).toEqual([]);
  });

  it("should return an array of integers for valid workerIds", () => {
    const req = {
      query: { taskStatus: "COMPLETE", workerIds: "1,2,3" },
    } as unknown as Request;
    const result = getAnalyticQueryParams(req);
    expect(result.workerIds).toEqual([1, 2, 3]);
  });

  it("should throw an error if workerIds contains non-integer values", () => {
    const req = {
      query: { taskStatus: "COMPLETE", workerIds: "1,abc,3" },
    } as unknown as Request;
    try {
      getAnalyticQueryParams(req);
      fail("Expected an error to be thrown, but none was thrown.");
    } catch (e) {
      expect(e.status).toBe("error");
      expect(e.message).toBe("Validation failed");
      expect(e.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message:
              "workerIds query parameter must be a comma-separated list of non-negative integers",
          }),
        ])
      );
    }
  });

  it("should return an empty array if workerIds is an empty string", () => {
    const req = {
      query: { taskStatus: "COMPLETE", workerIds: "" },
    } as unknown as Request;
    const result = getAnalyticQueryParams(req);
    expect(result.workerIds).toEqual([]);
  });

  it("should ignore workerIds with NaN values", () => {
    const req = {
      query: { taskStatus: "COMPLETE", workerIds: "1,,3" },
    } as unknown as Request;
    const result = getAnalyticQueryParams(req);
    expect(result.workerIds).toEqual([1, 3]);
  });

  it("should throw an error if workerIds contains negative values", () => {
    const req = {
      query: { taskStatus: "COMPLETE", workerIds: "1,-5,3" },
    } as unknown as Request;
    try {
      getAnalyticQueryParams(req);
      fail("Expected an error to be thrown, but none was thrown.");
    } catch (e) {
      expect(e.status).toBe("error");
      expect(e.message).toBe("Validation failed");
      expect(e.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message:
              "workerIds query parameter must be a comma-separated list of non-negative integers",
          }),
        ])
      );
    }
  });
});
