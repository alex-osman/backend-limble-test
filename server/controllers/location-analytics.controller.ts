import express from "express";
import {
  APIResponse,
  buildBaseQuery,
  getAnalyticQueryParams,
  LocationBreakdown,
  SECONDS_IN_HOUR,
  TaskStatus,
} from "./controller-helpers";

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
  }[] = await buildBaseQuery(taskStatus, workerIds, locationIds)
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
