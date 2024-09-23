import { DataSource } from "typeorm";
import { Worker } from "./entities/worker.entity";
import { LoggedTime } from "./entities/logged-time.entity";
import { Task } from "./entities/task.entity";
import { Location } from "./entities/location.entity";

const AppDataSource = new DataSource({
  type: "mariadb",
  host: process.env["DATABASE_HOST"],
  port: 3306,
  username: process.env["DATABASE_USER"],
  password: process.env["DATABASE_PASSWORD"],
  database: process.env["DATABASE_NAME"],
  entities: [Worker, LoggedTime, Task, Location],
});
export default AppDataSource;