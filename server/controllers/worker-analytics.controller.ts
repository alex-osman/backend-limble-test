import express from "express";
import {
  APIResponse,
  buildBaseQuery,
  getAnalyticQueryParams,
  SECONDS_IN_HOUR,
  TaskStatus,
  WorkerBreakdown,
} from "./controller-helpers";

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
  }[] = await buildBaseQuery(taskStatus, workerIds, locationIds)
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
