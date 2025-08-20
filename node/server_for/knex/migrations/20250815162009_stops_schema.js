/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("stops", function (table) {
      table.integer("stop_id");
      table.string("stop_code");
      table.string("stop_name");
      table.string("stop_desc");
      table.string("stop_url");
      table.string("location_type");
      table.string("parent_station");
      table.integer("thoreb_id");
    })
    .then(function () {
      // Set stop_id to id where stop_id is null and id is a valid integer
      return knex.raw(`
        UPDATE "stops"
        SET "stop_id" = CAST("id" AS INTEGER)
        WHERE "stop_id" IS NULL AND "id" ~ '^\\d+$'
      `);
    })
    .then(function () {
      // Delete rows where stop_id is still null to avoid primary key constraint error
      return knex.raw(`
        DELETE FROM "stops"
        WHERE "stop_id" IS NULL
      `);
    })
    .then(function () {
      return knex
        .raw('ALTER TABLE "stops" DROP CONSTRAINT IF EXISTS "stops_pkey"')
        .then(function () {
          return knex.raw('ALTER TABLE "stops" ADD PRIMARY KEY ("stop_id")');
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.alterTable("stops", function (table) {
    table.dropPrimary("stop_id");
    table.dropColumn("stop_code");
    table.dropColumn("stop_name");
    table.dropColumn("stop_desc");
    table.dropColumn("stop_url");
    table.dropColumn("location_type");
    table.dropColumn("parent_station");
    table.dropColumn("thoreb_id");
    table.primary("id");
  });
};
