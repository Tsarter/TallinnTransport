/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.dropTableIfExists("shapes").then(() => {
    return knex.schema.createTable("shapes", (table) => {
      table.string("shape_id").notNullable().primary();
      table
        .specificType("shape_geom", "geometry(LINESTRING, 4326)")
        .notNullable();
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("shapes").then(() => {
    return knex.schema.createTable("shapes", (table) => {
      table.string("shape_id").notNullable();
      table.decimal("shape_pt_lat", 9, 6).notNullable();
      table.decimal("shape_pt_lon", 9, 6).notNullable();
      table.integer("shape_pt_sequence").notNullable();
      table.integer("shape_dist_traveled").nullable();
      table.primary(["shape_id", "shape_pt_sequence"]);
    });
  });
};
