import express from "express";
import * as mariadb from "mariadb";
import morgan from "morgan";

const app = express();
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
const port = 3000;
let db;

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

async function main() {
  await connect();

  app.get("/", (req, res) => {
    console.log("Hello");
    res.send("Hello!");
  });

  app.listen(port, "0.0.0.0", () => {
    console.info(`App listening on ${port}.`);
  });
}

console.log("~~~~~\n\n\nSERVER\n\n\n~~~~~")
await main();
