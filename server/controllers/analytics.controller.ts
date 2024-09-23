import express from "express";
import AppDataSource from "../db";
import { LoggedTime } from "../entities/logged-time.entity";

const SECONDS_IN_HOUR = 3600;

export enum TaskStatus {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
  BOTH = "BOTH",
}

export const costByWorkerRoute = async (
  req: express.Request,
  res: express.Response
) => {
  const result = await costByWorker(TaskStatus.BOTH);
  res.send(result);
};

export const costByWorker = async (
  taskStatus: TaskStatus,
  workerIds?: number[]
): Promise<{
  status: "success" | "error";
  data: {
    totalCost: number;
    breakdown: {
      workerId: number;
      totalCost: number;
    }[];
  };
  filters: {
    taskStatus: TaskStatus;
    workerIds?: number[];
  };
}> => {
  const loggedTimes = await AppDataSource.getRepository(LoggedTime).find({
    relations: ["worker", "task"],
  });

  const breakdownDict: { [workerId: number]: number } = loggedTimes.reduce(
    (workerDict, loggedTime) => {
      const loggedTimeCost =
        (loggedTime.time_seconds /
        SECONDS_IN_HOUR) *
        loggedTime.worker.hourly_wage;

      if (workerDict[loggedTime.worker.id]) {
        workerDict[loggedTime.worker.id] += loggedTimeCost;
      } else {
        workerDict[loggedTime.worker.id] = loggedTimeCost;
      }
      return workerDict;
    },
    {} as { [workerId: number]: number }
  );

  const breakdown = Object.entries(breakdownDict).map(([workerId, totalCost]) => ({
    workerId: parseInt(workerId),
    totalCost,
  }));

  try {
    return {
      status: "success",
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
      status: "error",
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
