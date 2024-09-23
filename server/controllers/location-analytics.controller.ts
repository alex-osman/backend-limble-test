import express from "express";
import {
  APIResponse,
  LocationBreakdown,
  SECONDS_IN_HOUR,
  TaskStatus,
  validateObjectIds,
  validateTaskStatus,
} from "./controller-helpers";
import AppDataSource from "../db";
import { LoggedTime } from "../entities/logged-time.entity";

export const costByLocationRoute = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // Validate query parameters
    const taskStatus = validateTaskStatus(req.query.taskStatus?.toString());
    const locationIds = req.query.locationIds
      ? validateObjectIds(req.query.locationIds)
      : undefined;

    const result = await costByLocation(taskStatus, locationIds);
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
};

export const costByLocation = async (
  taskStatus: TaskStatus,
  locationIds?: number[]
): Promise<APIResponse<LocationBreakdown>> => {
  const loggedTimesQB = AppDataSource.getRepository(LoggedTime)
    .createQueryBuilder("logged_time")
    .leftJoinAndSelect("logged_time.worker", "worker")
    .leftJoinAndSelect("logged_time.task", "task")
    .leftJoinAndSelect("task.location", "location");

  if (taskStatus !== TaskStatus.BOTH) {
    loggedTimesQB.where("task.is_complete = :isComplete", {
      isComplete: taskStatus === TaskStatus.COMPLETE ? true : false,
    });
  }

  if (locationIds && locationIds.length > 0) {
    loggedTimesQB.andWhere("location.id IN (:...locationIds)", {
      locationIds,
    });
  }

  const queryResult: {
    locationId: number;
    locationName: string;
    totalCost: number;
  }[] = await loggedTimesQB
    .select([
      "location.id AS locationId",
      "location.name AS locationName",
      `SUM(logged_time.time_seconds / ${SECONDS_IN_HOUR} * worker.hourly_wage) AS totalCost`,
    ])
    .groupBy("location.id")
    .getRawMany();

  const breakdown = queryResult.map(({ locationId, locationName, totalCost }) => ({
    locationId: Number(locationId),
    locationName,
    totalCost: Number(totalCost),
  }));

  return {
    data: {
      totalCost: breakdown.reduce((acc, { totalCost }) => acc + totalCost, 0),
      breakdown,
    },
    filters: {
      taskStatus,
      workerIds: locationIds,
    },
  };
};
