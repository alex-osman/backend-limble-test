import { validateTaskStatus, TaskStatus, validateObjectIds } from "../controllers/controller-helpers";

describe("validateTaskStatus", () => {
  it("should return COMPLETE for 'complete'", () => {
    const result = validateTaskStatus("complete");
    expect(result).toBe(TaskStatus.COMPLETE);
  });

  it("should return INCOMPLETE for 'incomplete'", () => {
    const result = validateTaskStatus("incomplete");
    expect(result).toBe(TaskStatus.INCOMPLETE);
  });

  it("should return BOTH for 'both'", () => {
    const result = validateTaskStatus("both");
    expect(result).toBe(TaskStatus.BOTH);
  });

  it("should throw an error when taskStatus is missing", () => {
    expect(() => validateTaskStatus()).toThrow(
      "The 'taskStatus' query parameter is required."
    );
  });

  it("should throw an error for an invalid taskStatus", () => {
    expect(() => validateTaskStatus("invalid")).toThrow(
      "The 'taskStatus' query parameter must be one of 'COMPLETE', 'INCOMPLETE', or 'BOTH'."
    );
  });
});

describe("validateObjectIds", () => {
  it("should return an empty array when workerIds is undefined", () => {
    const result = validateObjectIds(undefined);
    expect(result).toEqual([]);
  });

  it("should return an array of integers for valid workerIds", () => {
    const result = validateObjectIds("1,2,3");
    expect(result).toEqual([1, 2, 3]);
  });

  it("should throw an error if workerIds contains non-integer values", () => {
    expect(() => validateObjectIds("1,abc,3")).toThrow(
      "workerIds query parameter must be a comma-separated list of non-negative integers"
    );
  });

  it("should return an empty array if workerIds is an empty string", () => {
    const result = validateObjectIds("");
    expect(result).toEqual([]);
  });
  

  it("should throw an error if workerIds contains NaN values", () => {
    expect(() => validateObjectIds("1,,3")).toThrow(
      "workerIds query parameter must be a comma-separated list of non-negative integers"
    );
  });
  
  it("should throw an error if workerIds contains NaN values", () => {
    expect(() => validateObjectIds("1,-5, -3")).toThrow(
      "workerIds query parameter must be a comma-separated list of non-negative integers"
    );
  });
});
