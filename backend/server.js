require('dotenv').config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const matchRoutes = require("./routes/matchRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const connectDB = require("./config/database");

const app = express();

// ✅ Enable CORS before any routes
app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // allow your React app
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, // only if you're using cookies or tokens
    optionsSuccessStatus: 200 // some legacy browsers choke on 204
  })
);

// ✅ Handle preflight globally (important) - removed problematic wildcard

// Parse JSON
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/sessions", sessionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Connect to database
connectDB();

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
