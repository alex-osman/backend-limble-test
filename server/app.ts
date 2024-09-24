import express from "express";
import morgan from "morgan";
import AppDataSource from "./db";
import {
  costByLocationRoute,
  costByWorkerRoute,
} from "./controllers/analytics.controller";

const app = express();
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

export const setupServer = async () => {
  // Initialize the database
  await AppDataSource.initialize();

  // Register the analytics routes
  const ANALYTICS_PREFIX = "/analytics";

  app.get(`${ANALYTICS_PREFIX}/by-worker`, costByWorkerRoute);
  app.get(`${ANALYTICS_PREFIX}/by-location`, costByLocationRoute);

  // Register the 404 route
  app.use((_req, res) => {
    res.status(404).send("Not found");
  });

  return app;
};
