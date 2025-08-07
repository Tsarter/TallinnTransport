/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("shapes", (table) => {
    table.string("shape_id").notNullable(); // GTFS shape_id
    table.decimal("shape_pt_lat", 9, 6).notNullable(); // Latitude: e.g. 59.43907
    table.decimal("shape_pt_lon", 9, 6).notNullable(); // Longitude: e.g. 24.75912
    table.integer("shape_pt_sequence").notNullable(); // Order of the point
    table.integer("shape_dist_traveled").nullable(); // Optional cumulative distance

    // Composite primary key (common in GTFS): shape_id + shape_pt_sequence
    table.primary(["shape_id", "shape_pt_sequence"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("shapes");
};
