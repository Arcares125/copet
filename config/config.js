
require('dotenv').config()
module.exports = {
  "development": {
    "username": process.env.DB_USERNAME,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.PGPORT,
    "logging": false
  },
  "test": {
    "username": process.env.DB_USERNAME,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.PGPORT,
    "logging": false
  },
  "production": {
    "username": process.env.DB_USERNAME,
    "password": process.env.PGPASSWORD,
    "database": process.env.PGDATABASE,
    "host": process.env.PGHOST,
    "dialect": process.env.DB_DIALECT,
    "port": process.env.PGPORT,
    "logging": false
  }

  // "development": {
  //   "username": process.env.DB_USERNAME,
  //   "password": process.env.DB_PASS,
  //   "database": process.env.DB_NAME,
  //   "host": process.env.DB_HOST,
  //   "dialect": process.env.DB_DIALECT,
  //   "port": process.env.DB_PORT
  // },
  // "test": {
  //   "username": process.env.DB_USERNAME,
  //   "password": process.env.DB_PASS,
  //   "database": process.env.DB_NAME,
  //   "host": process.env.DB_HOST,
  //   "dialect": process.env.DB_DIALECT,
  //   "port": process.env.DB_PORT
  // },
  // "production": {
  //   "username": process.env.DB_USERNAME,
  //   "password": process.env.DB_PASS,
  //   "database": process.env.DB_NAME,
  //   "host": process.env.DB_HOST,
  //   "dialect": process.env.DB_DIALECT,
  //   "port": process.env.DB_PORT
  // }
}