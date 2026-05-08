require("dotenv").config();
const app = require("./app");
const { sequelize } = require("./models");
const { registerListeners } = require("./events/userListeners");

registerListeners();

const PORT = process.env.PORT || 5000;

process.on("exit", (code) => {
  console.log("Process exit with code:", code);
});

process.on("SIGINT", () => {
  console.log("SIGINT received");
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    const syncOptions = process.env.DB_SYNC_ALTER === "true" ? { alter: true } : {};
    await sequelize.sync(syncOptions);
    console.log("Database synced");

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Address:", server.address());
    });
  } catch (error) {
    console.error("Server start error:", error);
  }
};

startServer();
