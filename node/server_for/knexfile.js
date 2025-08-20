// Update with your config settings.
require("dotenv").config();

if (!process.env.POSTGRES_PASSWORD) {
  console.log("process.env ", process.env);
  console.log("Make sure you are in the folder with .env file");
  //throw new Error('Missing POSTGRES_PASSWORD in environment variables');
}

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "postgresql",
    connection: {
      host: process.env.POSTGRES_HOST || "127.0.0.1",
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.TRANSPORT_DB,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + "/knex/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: __dirname + "/knex/seeds",
    },
  },

  staging: {
    client: "postgresql",
    connection: {
      database: process.env.TRANSPORT_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + "/knex/migrations",
      tableName: "knex_migrations",
    },
  },
  production: {
    client: "postgresql",
    connection: {
      host: process.env.POSTGRES_HOST || "127.0.0.1",
      user: process.env.PG_TANEL_USER,
      password: process.env.PG_TANEL_PASSWORD,
      database: process.env.TRANSPORT_DB,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: __dirname + "/knex/migrations",
      tableName: "knex_migrations",
    },
  },
};
