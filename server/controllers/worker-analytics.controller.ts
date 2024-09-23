import express from "express";
import AppDataSource from "../db";
import { LoggedTime } from "../entities/logged-time.entity";
import {
  APIResponse,
  APIResponseStatus,
  SECONDS_IN_HOUR,
  TaskStatus,
  validateObjectIds,
  validateTaskStatus,
  WorkerBreakdown,
} from "./controller-helpers";

export const costByWorkerRoute = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // Validate query parameters
    const taskStatus = validateTaskStatus(req.query.taskStatus?.toString());
    const workerIds = req.query.workerIds
      ? validateObjectIds(req.query.workerIds)
      : undefined;

    const result = await costByWorker(taskStatus, workerIds);
    res.send(result);
  } catch (e) {
    console.error(e);
    res.status(400).send(e.message);
  }
};

export const costByWorker = async (
  taskStatus: TaskStatus,
  workerIds?: number[]
): Promise<APIResponse<WorkerBreakdown>> => {
  const loggedTimesQB = AppDataSource.getRepository(LoggedTime)
    .createQueryBuilder("logged_time")
    .leftJoinAndSelect("logged_time.worker", "worker")
    .leftJoinAndSelect("logged_time.task", "task");
  
  if (taskStatus !== TaskStatus.BOTH) {
    loggedTimesQB.where("task.is_complete = :isComplete", {
      isComplete: taskStatus === TaskStatus.COMPLETE ? true : false,
    });
  }

  if (workerIds && workerIds.length > 0) {
    loggedTimesQB.andWhere("worker.id IN (:...workerIds)", {
      workerIds,
    });
  }
  const queryResult: {
    workerId: number;
    workerName: string;
    totalCost: number;
  }[] = await loggedTimesQB
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
    status: APIResponseStatus.SUCCESS,
    data: {
      totalCost: breakdown.reduce((acc, { totalCost }) => acc + totalCost, 0),
      breakdown,
    },
    filters: {
      taskStatus,
      workerIds,
    },
  };
};
