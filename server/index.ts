import setupServer from "./app.js";

const port = 3000;

async function main() {
  const app = await setupServer();
  app.listen(port, "0.0.0.0", () => {
    console.info(`App listening on ${port}.`);
  });
}

await main();
