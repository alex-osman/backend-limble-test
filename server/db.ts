import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
  type: "mariadb",
  host: process.env["DATABASE_HOST"],
  port: 3306,
  username: process.env["DATABASE_USER"],
  password: process.env["DATABASE_PASSWORD"],
  database: process.env["DATABASE_NAME"],
});

export default AppDataSource;