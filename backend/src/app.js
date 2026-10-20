import express from 'express';
import cors from 'cors';
import areasRoutes from './routes/areas.routes.js';
import adsRoutes from './routes/ads.routes.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Middleware
app.use(cors());          // allow requests from the frontend (different port)
app.use(express.json());  // parse JSON request bodies into req.body

// Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/areas', areasRoutes);
app.use('/api/ads', adsRoutes);

// Errors 
app.use(notFound);
app.use(errorHandler);

export default app;
