const pg = require('./knex');

module.exports = async () => {
    await pg.schema.createTableIfNotExists('payment_record', (table) => {
        table.increments('id');
        table.string('order_customer').notNullable();
        table.string('order_phone').notNullable();
        table.float('order_price').notNullable();
        table.string('order_currency', 10).notNullable();
        table.string('gateway', 30).notNullable();
        table.string('payment_id').notNullable();
        table.text('response');
        table.timestamps();
        table.unique(['order_customer', 'payment_id']);
    });
};

