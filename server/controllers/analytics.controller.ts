import express from "express";
import {
  APIResponse,
  buildBaseAnalyticsQuery,
  getAnalyticQueryParams,
  LocationBreakdown,
  SECONDS_IN_HOUR,
  TaskStatus,
  WorkerBreakdown,
} from "./controller-helpers";

// Location Analytics

export const costByLocationRoute = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { taskStatus, locationIds, workerIds } = getAnalyticQueryParams(req);
    const result = await costByLocation(taskStatus, locationIds, workerIds);
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
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

// Worker Analytics

export const costByWorkerRoute = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { taskStatus, locationIds, workerIds } = getAnalyticQueryParams(req);
    const result = await costByWorker(taskStatus, workerIds, locationIds);
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
};

export const costByWorker = async (
  taskStatus: TaskStatus,
  workerIds?: number[],
  locationIds?: number[]
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
