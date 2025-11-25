/// <reference types="node" />
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import express from "express";
import cors from "cors";
import { places } from "./db/schema";

const client = createClient({ url: process.env.DB_FILE_NAME! });
const db = drizzle({ client });

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from Backend!");
});

app.get("/places", async (req, res) => {
  try {
    const allPlaces = await db.select().from(places);
    res.json(allPlaces);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
