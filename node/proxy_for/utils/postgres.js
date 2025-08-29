import path from "path";
import dotenv from "dotenv";
import knex from "knex";

import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

export const db = knex({
  client: "postgresql",
  connection: {
    host: process.env.POSTGRES_HOST || "127.0.0.1",
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.PG_TANEL_USER,
    password: process.env.PG_TANEL_PASSWORD,
    database: process.env.TRANSPORT_DB,
  },
  pool: { min: 2, max: 10 },
});
