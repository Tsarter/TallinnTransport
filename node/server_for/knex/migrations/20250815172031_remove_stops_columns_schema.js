/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.alterTable("stops", function (table) {
    table.dropColumn("id0");
    table.dropColumn("name");
    table.dropColumn("stop_url");
    table.dropColumn("location_type");
    table.dropColumn("parent_station");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("stops", function (table) {
    table.integer("id0");
    table.string("name");
    table.string("stop_url");
    table.string("location_type");
    table.string("parent_station");
  });
};
