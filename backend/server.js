
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const postsRouter = require("./routes/posts");
const usersRouter = require("./routes/users");
const connectRouter = require("./routes/connect");

const app = express();

app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://10.152.24.16:8081'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Profile and post images supplied with the design.
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Register routes before starting the server.
app.get("/", (req, res) => {
  res.json({ message: "TheBrandopedia API is running" });
});

app.use("/posts", postsRouter);
app.use("/users", usersRouter);
app.use("/connect", connectRouter);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });

    console.log("MongoDB connected successfully");

    app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://127.0.0.1:${PORT}`);
  });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
