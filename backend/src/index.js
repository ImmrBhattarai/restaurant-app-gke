// src/index.js

const express = require("express");
const cors = require("cors");

// Import DB helpers
const { initDb, createOrder, getAllOrders } = require("./db");

// Configuration
const PORT = process.env.PORT || 4000;

// Hard-coded menu items (unchanged)
const MENU_ITEMS = [
  { id: 1, name: "Margherita Pizza", price: 8.99 },
  { id: 2, name: "Pepperoni Pizza", price: 9.99 },
  { id: 3, name: "Veggie Burger", price: 7.5 },
  { id: 4, name: "Cheeseburger", price: 8.0 },
  { id: 5, name: "Caesar Salad", price: 6.5 },
  { id: 6, name: "Pasta Alfredo", price: 10.0 },
  { id: 7, name: "Chicken Wings", price: 9.0 },
  { id: 8, name: "Tomato Soup", price: 5.5 },
  { id: 9, name: "French Fries", price: 3.5 },
  { id: 10, name: "Chocolate Cake", price: 4.0 },
];

const app = express();
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Menu endpoint
app.get("/api/menu", (req, res) => {
  res.json(MENU_ITEMS);
});

// Create order (now using DB)
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, address, itemId, quantity } = req.body;

    if (!customerName || !address || !itemId || !quantity) {
      return res.status(400).json({
        error: "Missing required fields: customerName, address, itemId, quantity",
      });
    }

    const item = MENU_ITEMS.find((m) => m.id === Number(itemId));
    if (!item) {
      return res.status(400).json({ error: "Invalid itemId" });
    }

    // Insert into DB
    const newOrder = await createOrder({
      customerName,
      address,
      itemId: item.id,
      quantity: Number(quantity),
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all orders from DB
app.get("/api/orders", async (req, res) => {
  try {
    const allOrders = await getAllOrders();
    res.json(allOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server AFTER DB is initialized
async function startServer() {
  try {
    await initDb();

    app.listen(PORT, () => {
      console.log(`Backend API server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1); // In a real app, you'd also have restart policies (Kubernetes handles that).
  }
}

startServer();
