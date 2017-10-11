const knex = require('knex');
const dbName = process.env.POSTGRES_DB;
const dbUrl = process.env.DATABASE_URL;

const pg = knex({
    client: 'pg',
    connection: `${dbUrl}/${dbName}`,
    ssl: process.env.NODE_ENV === 'production',
    pool: { min: 0, max: 7 }
});

module.exports = pg;
