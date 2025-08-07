/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("routes", (table) => {
    table.string("route_id").primary();
    table.string("route_short_name").notNullable();
    table.string("route_long_name").notNullable();
    table.text("route_desc").nullable();
    table.integer("route_type").notNullable();
    table.string("route_url").nullable();
    table.string("route_color").nullable();
    table.string("route_text_color").nullable();
    table.integer("route_sort_order").nullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("routes");
};
