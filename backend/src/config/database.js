import mongoose from "mongoose"
import { DB_NAME } from "./constants.js";

/**
 * Returns MONGODB_URI if set. Otherwise starts an in-memory MongoDB
 * (data is lost when the server stops), so the app runs without a database install.
 */
const getMongoUri = async () => {
    if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

    console.log("MONGODB_URI not set, starting in-memory MongoDB (first run downloads it, may take a minute)...");
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    // First launch on Windows can be slow (antivirus scans the new mongod binary)
    const memoryServer = await MongoMemoryServer.create({ instance: { launchTimeout: 60000 } });
    return memoryServer.getUri();
};

/** Connects to MongoDB. Exits the process on failure. */
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(await getMongoUri(), {
            dbName: DB_NAME
        });
        console.log(`\n MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1);
    }
};
export default connectDB;
