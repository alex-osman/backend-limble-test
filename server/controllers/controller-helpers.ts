import express from "express";
import AppDataSource from "../db";
import { LoggedTime } from "../entities/logged-time.entity";

export const SECONDS_IN_HOUR = 3600;

export enum TaskStatus {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
  BOTH = "BOTH",
}

export interface WorkerBreakdown {
  workerId: number;
  workerName: string;
  totalCost: number;
}

export interface LocationBreakdown {
  locationId: number;
  locationName: string;
  totalCost: number;
}

export interface APIResponse<T extends WorkerBreakdown | LocationBreakdown> {
  data: {
    totalCost: number;
    breakdown: T[];
  };
}

/**
 * Validates the taskStatus query parameter and ensures it is one of the allowed values.
 * @param taskStatus - The task status string from the query parameters.
 * @returns The validated TaskStatus enum value.
 * @throws Error if the taskStatus is missing or invalid.
 */
export const validateTaskStatus = (taskStatus?: string): TaskStatus => {
  if (!taskStatus) {
    throw new Error("The 'taskStatus' query parameter is required.");
  }

  const uppercaseStatus = taskStatus.toUpperCase();

  // Check if valid enum
  if (!(uppercaseStatus in TaskStatus)) {
    throw new Error(
      "The 'taskStatus' query parameter must be one of 'COMPLETE', 'INCOMPLETE', or 'BOTH'."
    );
  }

  return uppercaseStatus as TaskStatus;
};

/**
 * Validates the query parameter and ensures it's a list of valid integers
 * @param objectIds - The workerIds or locationIds query parameter as a string (comma-separated).
 * @returns An array of parsed integers.
 * @throws Error if the workerIds contains invalid values or is an empty string.
 */
export const validateObjectIds = (objectIds: any): number[] => {
  if (!objectIds) {
    return [];
  }
  const parsedWorkerIds = objectIds.split(",").map((id) => parseInt(id));
  if (parsedWorkerIds.some((id) => isNaN(id) || id < 0)) {
    throw new Error(
      "workerIds query parameter must be a comma-separated list of non-negative integers"
    );
  }
  if (!parsedWorkerIds.length) {
    throw new Error("workerIds query parameter must contain at least one ID");
  }
  return parsedWorkerIds;
};

/**
 * Extracts the query parameters from the request object and validates them.
 * @param req - The request object from the Express route.
 * @returns An object containing the validated query parameters.
 */
export const getAnalyticQueryParams = (req: express.Request) => {
  return {
    taskStatus: validateTaskStatus(req.query.taskStatus?.toString()),
    workerIds: validateObjectIds(req.query.workerIds),
    locationIds: validateObjectIds(req.query.locationIds),
  };
};

/**
 * Builds the base query for calculating labor costs based on task status, worker, and location filters.
 * @param taskStatus - The task status filter.
 * @param workerIds - Optional list of worker IDs to filter by.
 * @param locationIds - Optional list of location IDs to filter by.
 * @returns A QueryBuilder for querying the logged_time entity.
 */
export const buildBaseAnalyticsQuery = (
  taskStatus: TaskStatus,
  workerIds?: number[],
  locationIds?: number[]
) => {
  const loggedTimesQB = AppDataSource.getRepository(LoggedTime)
    .createQueryBuilder("logged_time")
    .leftJoin("logged_time.worker", "worker")
    .leftJoin("logged_time.task", "task")
    .leftJoin("task.location", "location");

  // Add task status filtering
  if (taskStatus !== TaskStatus.BOTH) {
    loggedTimesQB.where("task.is_complete = :isComplete", {
      isComplete: taskStatus === TaskStatus.COMPLETE,
    });
  }

  // Add location filtering
  if (locationIds && locationIds.length > 0) {
    loggedTimesQB.andWhere("location.id IN (:...locationIds)", {
      locationIds,
    });
  }

  // Add worker filtering
  if (workerIds && workerIds.length > 0) {
    loggedTimesQB.andWhere("worker.id IN (:...workerIds)", {
      workerIds,
    });
  }

  return loggedTimesQB;
};
