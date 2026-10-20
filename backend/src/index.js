// Must be the first import: loads .env before any other module reads process.env
import 'dotenv/config';
import connectDB from './config/database.js';
import app from './app.js';

const startServer = async () => {
    try {
        await connectDB();

        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running on PORT: ${process.env.PORT}`)
        });
    } catch (error) {
        console.log("Mongo db connection failed", error);
    }


}

startServer();
