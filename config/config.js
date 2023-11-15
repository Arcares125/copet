
require('dotenv').config()
module.exports = {
  "development": {
    // "username": process.env.DB_USERNAME,
    // "password": process.env.DB_PASS,
    // "database": process.env.DB_NAME,
    // "host": process.env.DB_HOST,
    // "dialect": process.env.DB_DIALECT,
    // "port": process.env.DB_PORT
    "username": process.env.DB_USERNAME,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.PGPORT
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.PGPORT
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.PGPORT
  }
}
