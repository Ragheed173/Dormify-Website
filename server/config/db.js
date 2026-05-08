const path = require('path')
const mysql = require('mysql2/promise')
const { Sequelize } = require('sequelize')

require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env'),
})

const dbHost = process.env.DB_HOST || 'localhost'
const dbPort = Number(process.env.DB_PORT) || 5000
const dbName = process.env.DB_NAME || 'housing_db'
const dbUser = process.env.DB_USER || 'root'
const dbPassword = process.env.DB_PASSWORD ?? ''

const pool = mysql.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
  queueLimit: 0,
})

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    decimalNumbers: true,
  },
})

module.exports = sequelize
module.exports.sequelize = sequelize
module.exports.pool = pool
