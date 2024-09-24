import express from "express";
import AppDataSource from "../db";
import { LoggedTime } from "../entities/logged-time.entity";
import Joi from "joi";

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

type AnalyticsQueryParams = {
  taskStatus: string;
  workerIds?: string;
  locationIds?: string;
}

export type CostCalculator = (
  taskStatus: TaskStatus,
  locationIds?: number[],
  workerIds?: number[]
) => Promise<APIResponse<WorkerBreakdown | LocationBreakdown>>;

/**
 * Joi schema for validating the query parameters for the analytics routes
 */
export const querySchema = Joi.object<AnalyticsQueryParams>({
  taskStatus: Joi.string()
    .valid(...Object.values(TaskStatus))
    .required()
    .insensitive()
    .messages({
      "any.required": "The 'taskStatus' query parameter is required.",
      "any.only":
        "The 'taskStatus' query parameter must be one of 'COMPLETE', 'INCOMPLETE', or 'BOTH'.",
    }),
  workerIds: Joi.string()
    .pattern(/^[0-9,]+$/)
    .allow("")
    .messages({
      "string.pattern.base":
        "workerIds query parameter must be a comma-separated list of non-negative integers",
    }),
  locationIds: Joi.string()
    .pattern(/^[0-9,]+$/)
    .allow("")
    .messages({
      "string.pattern.base":
        "locationIds query parameter must be a comma-separated list of non-negative integers",
    }),
});

/**
 * Parses a comma-separated list of object IDs into an array of integers.
 * @param ids - A comma-separated list of object IDs.
 * @returns An array of integers representing the object IDs.
 */
const parseObjectIds = (ids?: string): number[] => {
  if (!ids) {
    return [];
  }
  return ids
    .split(",")
    .map((id) => parseInt(id))
    .filter((id) => !isNaN(id) && id >= 0);
};

/**
 * Extracts the query parameters from the request object and validates them.
 * @param req - The request object from the Express route.
 * @returns An object containing the validated query parameters.
 */
export const getAnalyticQueryParams = (req: express.Request) => {
  const { error, value } = querySchema.validate(req.query, {
    abortEarly: false,
  });
  if (error) {
    // Format the Joi error into a structured response
    const errors = error.details.map(detail => ({
      field: detail.context?.key,
      message: detail.message,
    }));

    throw {
      status: "error",
      message: "Validation failed",
      errors: errors
    }
  }

  const workerIds = parseObjectIds(value.workerIds);
  const locationIds = parseObjectIds(value.locationIds);
  return {
    taskStatus: value.taskStatus.toUpperCase() as TaskStatus,
    workerIds,
    locationIds,
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
