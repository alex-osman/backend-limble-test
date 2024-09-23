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

export const validateObjectIds = (workerIds: any): number[] => {
  if (!workerIds) {
    return [];
  }
  const parsedWorkerIds = workerIds.split(",").map((id) => parseInt(id));
  if (parsedWorkerIds.some((id) => isNaN(id))) {
    throw new Error(
      "workerIds query parameter must be a comma-separated list of integers"
    );
  }
  if (!parsedWorkerIds.length) {
    throw new Error("workerIds query parameter must contain at least one ID");
  }
  return parsedWorkerIds;
};

export const getAnalyticQueryParams = (req: express.Request) => {
  return {
    taskStatus: validateTaskStatus(req.query.taskStatus?.toString()),
    workerIds: validateObjectIds(req.query.workerIds),
    locationIds: validateObjectIds(req.query.locationIds),
  };
};

export const buildBaseQuery = (
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
