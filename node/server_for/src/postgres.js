const path = require("path");

require("dotenv").config({path: path.join(__dirname, "../.env")});

const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT || 5432,
    user: process.env.PG_TANEL_USER,
    password: process.env.PG_TANEL_PASSWORD,
    database: process.env.TRANSPORT_DB
  },
  pool: { min: 2, max: 10 }
});

module.exports = db;