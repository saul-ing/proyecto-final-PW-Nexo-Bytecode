import express from 'express';
import cors from 'cors';
import routes from './routes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;