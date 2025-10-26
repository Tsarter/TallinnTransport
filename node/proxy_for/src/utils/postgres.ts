import path from "path";
import dotenv from "dotenv";
import knex from "knex";

import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "../../../.env")
dotenv.config({ path: envPath });

export const db = knex({
  client: "postgresql",
  connection: {
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
    user: process.env.PG_TANEL_USER || "",
    password: process.env.PG_TANEL_PASSWORD || "",
    database: process.env.TRANSPORT_DB || "",
},
  pool: { min: 2, max: 10 },
});
