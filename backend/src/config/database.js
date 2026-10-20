import mongoose from "mongoose"
import { DB_NAME } from "./constants.js";

/** Connects to MongoDB using MONGODB_URI. Exits the process on failure. */
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_NAME
        });
        console.log(`\n MongoDB connected: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1);
    }
};
export default connectDB;
