/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('calendar', function(table) {
        table.string('service_id').primary();
        table.integer('monday').notNullable();
        table.integer('tuesday').notNullable();
        table.integer('wednesday').notNullable();
        table.integer('thursday').notNullable();
        table.integer('friday').notNullable();
        table.integer('saturday').notNullable();
        table.integer('sunday').notNullable();
        table.integer('start_date').notNullable();
        table.integer('end_date').notNullable();

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('calendar');
};
