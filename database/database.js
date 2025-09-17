const { MongoClient } = require("mongodb");

let db;

async function connectDB(uri, dbName) {
  console.log('Connecting DB');
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  console.log("MongoDB connected...");
}

function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}

module.exports = { connectDB, getDB };
