const { MongoClient } = require("mongodb");

let db;

async function connectDB(uri, dbName) {
  const maxRetries = 5;       // 5 maximum tries to reconnect
  const retryDelay = 3000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Connecting to MongoDB (attempt ${attempt})...`);
      const client = new MongoClient(uri);
      await client.connect();
      db = client.db(dbName);
      console.log("MongoDB connected!");      
      return;
    } catch (err) {
      console.error(`MongoDB connection failed (attempt ${attempt}): ${err.message}`);
      if (attempt === maxRetries) {
        throw new Error("Failed to connect to MongoDB after multiple attempts");
      }
      console.log(`Retrying in ${retryDelay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
}

function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}

module.exports = { connectDB, getDB };
