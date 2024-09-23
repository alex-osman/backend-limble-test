export const SECONDS_IN_HOUR = 3600;

export enum TaskStatus {
  COMPLETE = "COMPLETE",
  INCOMPLETE = "INCOMPLETE",
  BOTH = "BOTH",
}

export enum APIResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
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
  status: APIResponseStatus;
  data: {
    totalCost: number;
    breakdown: T[];
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
