/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("trips", (table) => {
    table.string("trip_id").primary(); // Usually unique in GTFS
    table.string("route_id").notNullable(); // FK to routes.route_id
    table.string("service_id").notNullable(); // References calendar.txt
    table.string("trip_headsign").notNullable(); // Human-readable destination
    table.integer("direction_id").notNullable(); // 0 or 1 (inbound/outbound)
    table.integer("block_id").nullable(); // Optional vehicle block ID
    table.string("shape_id").nullable(); // FK to shapes.shape_id
    table.integer("wheelchair_accessible").nullable(); // ""=no, 1=yes
    table.string("block_code").nullable(); // Custom code (non-standard GTFS)
    table.string("vehicle_type").nullable(); // 'L', 'T', etc. — non-standard
    table.integer("thoreb_id").nullable(); // Custom internal ID
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("trips");
};
