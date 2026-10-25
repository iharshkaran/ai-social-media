import "./config/loadEnv.js";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const port = Number(process.env.PORT) || 8000;
async function startServer() {
  try {
    await connectDB();
    const server = app.listen(port, () => console.log(`Connectly API listening on port ${port}`));
    const shutdown = (signal) => server.close(() => process.exit(signal === "SIGINT" ? 130 : 0));
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("Failed to start Connectly API:", error.message);
    process.exitCode = 1;
    
  }
}
startServer();
