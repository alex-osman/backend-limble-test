import { setupServer } from "./app";
import AppDataSource from "./db";

const port = 3000;

async function main() {
  const app = await setupServer();
  app.listen(port, "0.0.0.0", () => {
    console.info(`App listening on ${port}...`);
    
    // show the tables
    AppDataSource.query("SHOW TABLES").then((result) => {
      console.log(result);
    });
  });
}

main();
