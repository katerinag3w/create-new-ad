// Must be the first import: loads .env before any other module reads process.env
import 'dotenv/config';
import connectDB from './config/database.js';
import app from './app.js';

const startServer = async () => {
    try {
        await connectDB();

        const port = process.env.PORT || 8000;
        app.listen(port, () => {
            console.log(`Server is running on PORT: ${port}`)
        });
    } catch (error) {
        console.log("Mongo db connection failed", error);
    }


}

startServer();
