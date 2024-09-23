import express from "express";
import morgan from "morgan";
import AppDataSource from "./db";

const app = express();
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

export const setupServer = async () => {
  // Initialize the database
  await AppDataSource.initialize();


  app.get("/", (req, res) => {
    console.log("Hello");
    res.send("Hello!");
  });

  return app
};
