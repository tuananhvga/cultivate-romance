import express from "express";
import path from "path";
import { config as dotEnvConfig } from "dotenv"
import { HttpClient } from "./client";
import config from "../config.json";
import { check } from "./check";

dotEnvConfig();

const app = express();
const PORT = process.env.PORT || 3000;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

if (!REFRESH_TOKEN) {
  console.error("Error: REFRESH_TOKEN environment variable is not set.");
  process.exit(1);
}

let count = 0;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

const tokens = REFRESH_TOKEN.split(",");
const clients = tokens.map(token => new HttpClient({
  ...config,
  refreshToken: token.trim(),
}));

async function doCheck() {
  clients.forEach(client => {
    check(client).catch(error => {
      console.error("Error during check:", error);
    });
  });
}

app.get("/api/count", (_req, res) => {
  res.json({ count });
});

app.post("/api/count/increment", (_req, res) => {
  count += 1;
  res.json({ count });
});

app.post("/api/count/decrement", (_req, res) => {
  count -= 1;
  res.json({ count });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  setInterval(() => {
    doCheck();
  }, 5000);
});
