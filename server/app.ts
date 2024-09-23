import express from "express";
import * as mariadb from "mariadb";
import morgan from "morgan";

const app = express();
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

let db: mariadb.Pool;

async function connect() {
  console.info("Connecting to DB...");
  db = mariadb.createPool({
    host: process.env["DATABASE_HOST"],
    user: process.env["DATABASE_USER"],
    password: process.env["DATABASE_PASSWORD"],
    database: process.env["DATABASE_NAME"],
  });

  const conn = await db.getConnection();
  try {
    await conn.query("SELECT 1");
    console.log("Connection successful...");
  } finally {
    await conn.end();
  }
}

export const setupServer = async () => {
  await connect();

  app.get("/", (req, res) => {
    console.log("Hello");
    res.send("Hello!");
  });

  return { app, db };
}