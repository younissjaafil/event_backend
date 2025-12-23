const mysql = require("mysql2");
require("dotenv").config();

// Parse DATABASE_URL if provided, otherwise use individual env variables
let dbConfig;

if (process.env.DATABASE_URL) {
  // Parse the DATABASE_URL: mysql://user:password@host:port/database
  const dbUrl = new URL(process.env.DATABASE_URL);
  dbConfig = {
    host: dbUrl.hostname,
    port: dbUrl.port || 3306,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1), // Remove leading '/'
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(dbUrl.password + '\0')
    }
  };
} else {
  dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    authPlugins: {
      mysql_clear_password: () => () => Buffer.from(process.env.DB_PASSWORD + '\0')
    }
  };
}

// Create connection pool instead of single connection
const pool = mysql.createPool(dbConfig);

// Test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database:", dbConfig.host);
  connection.release();
});

// Use promises for async/await support
const dbPromise = pool.promise();

module.exports = { db: pool, dbPromise };

