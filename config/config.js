
require('dotenv').config()
module.exports = {

  // DATABASE_PRIVATE_URL=postgres://postgres:-e6dDgG2aDFEbCG1-51CB2gcGfbf*-g5@copet.railway.internal:5432/railway
  // DATABASE_URL=postgres://postgres:-e6dDgG2aDFEbCG1-51CB2gcGfbf*-g5@:/railway
  // PGDATA=/var/lib/postgresql/data/pgdata
  // PGDATABASE=railway
  // PGHOST=roundhouse.proxy.rlwy.net
  // PGPASSWORD=-e6dDgG2aDFEbCG1-51CB2gcGfbf*-g5
  // PGPORT=24426
  // PGUSER=postgres
  // POSTGRES_DB=railway
  // POSTGRES_PASSWORD=-e6dDgG2aDFEbCG1-51CB2gcGfbf*-g5
  // POSTGRES_USER=postgres
  // SSL_CERT_DAYS=820

  "development": {
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

    // "username": process.env.DB_USERNAME,
    // "password": process.env.DB_PASS,
    // "database": process.env.DB_NAME,
    // "host": process.env.DB_HOST,
    // "dialect": process.env.DB_DIALECT,
    // "port": process.env.DB_PORT
  }
}
