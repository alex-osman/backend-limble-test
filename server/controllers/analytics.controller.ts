import express from "express";
import AppDataSource from "../db";
import { LoggedTime } from "../entities/logged-time.entity";

const SECONDS_IN_HOUR = 3600;

export enum TaskStatus {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
  BOTH = "BOTH",
}

export enum APIResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export interface APIResponse {
  status: APIResponseStatus;
  data: {
    totalCost: number;
    breakdown: {
      workerId: number;
      workerName: string;
      totalCost: number;
    }[];
  };
  filters: {
    taskStatus: TaskStatus;
    workerIds?: number[];
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

export const validateWorkerIds = (workerIds: any): number[] => {
  console.log("what is your workerid");
  if (!workerIds) {
    return [];
  }
  const parsedWorkerIds = workerIds.split(",").map((id) => parseInt(id));
  if (parsedWorkerIds.some((id) => isNaN(id))) {
    throw new Error(
      "workerIds query parameter must be a comma-separated list of integers"
    );
  }
  return parsedWorkerIds;
};

export const costByWorkerRoute = async (
  req: express.Request,
  res: express.Response
) => {
  // Get the task status from the query string
  try {
    const taskStatus = validateTaskStatus(req.query.taskStatus?.toString());
    const workerIds =
      req.query.workerIds && validateWorkerIds(req.query.workerIds);

    const result = await costByWorker(taskStatus);
    res.send(result);
  } catch (e) {
    console.log(e);
    res.status(400).send(e.message);
  }
};

export const costByWorker = async (
  taskStatus: TaskStatus,
  workerIds?: number[]
): Promise<APIResponse> => {
  // Query for logged times
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

  const loggedTimes = await loggedTimesQB.getMany();

  const breakdownDict: {
    [workerId: number]: { totalCost: number; name: string };
  } = loggedTimes.reduce((workerDict, loggedTime) => {
    const loggedTimeCost =
      (loggedTime.time_seconds / SECONDS_IN_HOUR) *
      loggedTime.worker.hourly_wage;

    if (workerDict[loggedTime.worker.id]) {
      workerDict[loggedTime.worker.id].totalCost += loggedTimeCost;
    } else {
      workerDict[loggedTime.worker.id] = {
        totalCost: loggedTimeCost,
        name: loggedTime.worker.username,
      };
    }
    return workerDict;
  }, {} as { [workerId: number]: { totalCost: number; name: string } });

  const breakdown = Object.entries(breakdownDict).map(([workerId, worker]) => ({
    workerId: parseInt(workerId),
    totalCost: worker.totalCost,
    workerName: worker.name,
  }));

  try {
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
  } catch (error) {
    return {
      status: APIResponseStatus.ERROR,
      data: {
        totalCost: 0,
        breakdown: [],
      },
      filters: {
        taskStatus,
        workerIds,
      },
    };
  }
};
