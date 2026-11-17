const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB Connected Successfully!");

        await client.db("admin").command({ ping: 1 });
        console.log("Database Ping Successful!");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error);
    }
}

connectDB();