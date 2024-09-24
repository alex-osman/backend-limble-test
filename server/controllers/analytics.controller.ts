import express from "express";
import {
  APIResponse,
  buildBaseAnalyticsQuery,
  CostCalculator,
  getAnalyticQueryParams,
  LocationBreakdown,
  SECONDS_IN_HOUR,
  TaskStatus,
  WorkerBreakdown,
} from "./controller-helpers";

/**
 * Handles the cost calculation for the analytics routes
 */
const handleCostCalculation = (costCalculator: CostCalculator) => {
  return async (req: express.Request, res: express.Response) => {
    try {
      const { taskStatus, locationIds, workerIds } = getAnalyticQueryParams(req);
      const result = await costCalculator(taskStatus, locationIds, workerIds);
      res.send(result);
    } catch (e) {
      res.status(400).json({
        status: "error",
        message: e.message,
        errors: e.errors,
      });
    }
  };
};

/**
 * Route handler for the cost by location analytics route
 */
export const costByLocationRoute = async (
  req: express.Request,
  res: express.Response
) => {
  return handleCostCalculation(costByLocation)(req, res);
};

/**
 * Route handler for the cost by worker analytics route
 */
export const costByWorkerRoute = async (
  req: express.Request,
  res: express.Response
) => {
  return handleCostCalculation(costByWorker)(req, res);
};

export const costByLocation = async (
  taskStatus: TaskStatus,
  locationIds?: number[],
  workerIds?: number[]
): Promise<APIResponse<LocationBreakdown>> => {
  const queryResult: {
    locationId: number;
    locationName: string;
    totalCost: number;
  }[] = await buildBaseAnalyticsQuery(taskStatus, workerIds, locationIds)
    .select([
      "location.id AS locationId",
      "location.name AS locationName",
      `SUM(logged_time.time_seconds / ${SECONDS_IN_HOUR} * worker.hourly_wage) AS totalCost`,
    ])
    .groupBy("location.id")
    .getRawMany();

  const breakdown = queryResult.map(
    ({ locationId, locationName, totalCost }) => ({
      locationId: Number(locationId),
      locationName,
      totalCost: Number(totalCost),
    })
  );

  return {
    data: {
      totalCost: breakdown.reduce((acc, { totalCost }) => acc + totalCost, 0),
      breakdown,
    },
  };
};

export const costByWorker = async (
  taskStatus: TaskStatus,
  locationIds?: number[],
  workerIds?: number[]
): Promise<APIResponse<WorkerBreakdown>> => {
  const queryResult: {
    workerId: number;
    workerName: string;
    totalCost: number;
  }[] = await buildBaseAnalyticsQuery(taskStatus, workerIds, locationIds)
    .select([
      "worker.id AS workerId",
      "worker.username AS workerName",
      `SUM(logged_time.time_seconds / ${SECONDS_IN_HOUR} * worker.hourly_wage) AS totalCost`,
    ])
    .groupBy("worker.id")
    .getRawMany();

  const breakdown = queryResult.map(({ workerId, workerName, totalCost }) => ({
    workerId: Number(workerId),
    workerName,
    totalCost: Number(totalCost),
  }));

  return {
    data: {
      totalCost: breakdown.reduce((acc, { totalCost }) => acc + totalCost, 0),
      breakdown,
    },
  };
};
