import { setupServer } from "./app";

const port = 3000;

async function main() {
  const app = await setupServer();
  app.listen(port, "0.0.0.0", async () => {
    console.info(`App listening on ${port}...`);
  });
}

main();
