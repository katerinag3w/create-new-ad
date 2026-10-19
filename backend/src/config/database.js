import mongooose from "mongoose"

const connectDB = async () => {
    try {
        const connectionInstance = await mongooose.connect(`${process.env.MONGODB_URI}`)
        console.log(`\n Mongo db connected ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("MongoDB connection failed", error);
        process.exit(1);
    }
}

export default connectDB;