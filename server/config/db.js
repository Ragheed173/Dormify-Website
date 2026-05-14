const path = require('path')
const mysql = require('mysql2/promise')
const { Sequelize } = require('sequelize')

require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env'),
})

const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = Number(process.env.DB_PORT) || 3306
const dbName = process.env.DB_NAME || 'housing_db'
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD ?? ''

// Railway public MySQL (e.g. *.rlwy.net) expects TLS; DBeaver often enables SSL automatically.
const useDbSsl =
  process.env.DB_SSL === 'false'
    ? false
    : process.env.DB_SSL === 'true' || String(dbHost).includes('rlwy.net')

const sslOption = useDbSsl
  ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' }
  : undefined

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
  queueLimit: 0,
  ...(sslOption ? { ssl: sslOption } : {}),
})

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    decimalNumbers: true,
    ...(sslOption ? { ssl: sslOption } : {}),
  },
})

module.exports = sequelize
module.exports.sequelize = sequelize
module.exports.pool = pool
