/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable("stop_times", (table) => {
    table.string("trip_id").notNullable()
         .references("trip_id").inTable("trips")
         .onDelete("CASCADE");

    table.integer("stop_id").notNullable()
         .references("stop_id").inTable("stops")
         .onDelete("CASCADE");

    table.string("arrival_time").notNullable();
    table.string("departure_time").notNullable();
    table.integer("arrival_secs").notNullable();
    table.integer("departure_secs").notNullable();

    table.integer("stop_sequence").notNullable();

    table.primary(["trip_id", "stop_sequence"]);
  });

  // Helpful indexes for performance
  await knex.schema.alterTable("stop_times", (table) => {
    table.index(["stop_id", "arrival_time"], "idx_stop_times_stop");
    table.index(["trip_id", "stop_sequence"], "idx_stop_times_trip");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists("stop_times");
};
