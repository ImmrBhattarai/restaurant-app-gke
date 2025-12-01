// src/db.js

// This file centralizes all database-related logic.
// In a professional project, you'd:
// - Keep connection logic isolated
// - Export small helper functions (e.g., createOrder, getOrders)
// - Avoid sprinkling raw SQL everywhere in your app.

const { Pool } = require("pg");
const dotenv = require("dotenv");

// Load environment variables from .env in development.
// In production (Docker/Kubernetes), environment variables are injected directly,
// so dotenv is usually not used.
dotenv.config();

// Read DB config from environment variables.
// This makes it easy to change DB credentials or host between environments
// (local, Docker, Kubernetes, CI/CD, etc.).
const {
  DB_HOST = "localhost",
  DB_PORT = 5432,
  DB_USER = "restaurant_user",
  DB_PASSWORD = "restaurant_password",
  DB_NAME = "restaurant_db",
} = process.env;

// Create a connection pool.
// Professionals use a pool instead of a single connection so multiple requests
// can be handled efficiently.
const pool = new Pool({
  host: DB_HOST,
  port: Number(DB_PORT),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

// Helper function to initialize the database schema.
// This is a very lightweight migration-like step.
async function initDb() {
  // In a real-world app, you'd use migration tools (e.g., knex, Prisma, Flyway).
  // For this small project, a simple "CREATE TABLE IF NOT EXISTS" is enough.
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      address TEXT NOT NULL,
      item_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  await pool.query(createTableQuery);
  console.log("✅ Database initialized (orders table ready).");
}

// Helper to create a new order in the DB.
async function createOrder({ customerName, address, itemId, quantity }) {
  const insertQuery = `
    INSERT INTO orders (customer_name, address, item_id, quantity)
    VALUES ($1, $2, $3, $4)
    RETURNING id, customer_name, address, item_id, quantity, created_at;
  `;

  const values = [customerName, address, itemId, quantity];

  const result = await pool.query(insertQuery, values);
  // result.rows[0] holds the inserted row
  return result.rows[0];
}

// Helper to fetch all orders.
async function getAllOrders() {
  const result = await pool.query(
    "SELECT id, customer_name, address, item_id, quantity, created_at FROM orders ORDER BY id DESC;"
  );
  return result.rows;
}

module.exports = {
  pool,
  initDb,
  createOrder,
  getAllOrders,
};
