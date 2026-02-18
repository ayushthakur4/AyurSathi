require("dotenv").config();

// Fix DNS resolution for MongoDB Atlas SRV records
// Some networks/ISPs block or fail to resolve SRV records
const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const remedyRoutes = require("./routes/remedyRoutes");

const app = express();

app.use(cors());
app.use(express.json());

const mongoose = require("mongoose");

// Connect to MongoDB Atlas
// Connect to MongoDB Atlas
const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("❌ MONGODB_URI is not defined in environment variables.");
  // In production, we want to fail fast. In dev, we might tolerate it but it's risky.
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

console.log("Connecting to MongoDB...");

mongoose
  .connect(mongoURI, {
    serverSelectionTimeoutMS: 30000, // 30s
    connectTimeoutMS: 45000, // 45s
    socketTimeoutMS: 60000, // 60s
  })
  .then(() => console.log("MongoDB Connected successfully....."))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    // Avoid logging full URI with credentials
  });

mongoose.connection.on("disconnected", () =>
  console.log("⚠️ MongoDB disconnected"),
);
mongoose.connection.on("reconnected", () =>
  console.log("✅ MongoDB reconnected"),
);

// Health-check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "AyurSathi API is running 🌿" });
});

// ─── App Version / Update Check ───
app.get("/api/version", (req, res) => {
  res.json({
    latestVersion: "1.1.0",
    minVersion: "1.0.0",        // Force-update below this
    releaseNotes: [
      "✨ Brand new Apple-inspired UI",
      "🤖 Faster AI-powered search",
      "🧘 Improved yoga detail screens",
      "🐛 Bug fixes and performance improvements",
    ],
    updateUrl: "https://expo.dev/@ayushthakur4/ayursaathi-app",
    mandatory: false,
  });
});

app.use("/api/remedies", remedyRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`),
);
