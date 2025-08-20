/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw(`
    GRANT USAGE ON SCHEMA public TO tanel;
    GRANT SELECT ON TABLE trips, shapes, routes TO tanel;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw(`
    REVOKE SELECT ON TABLE trips, shapes, routes FROM tanel;
    REVOKE USAGE ON SCHEMA public FROM tanel;
  `);
};
