import express from 'express';
import cors from 'cors';
import { initDatabase } from './database';
import offersRouter from './routes/offers';
import listsRouter from './routes/lists';
import ratingsRouter from './routes/ratings';
import scrapeRouter from './routes/scrape';
import authRouter from './routes/auth';
import groupsRouter from './routes/groups';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.use('/api/offers', offersRouter);
app.use('/api/lists', listsRouter);
app.use('/api/ratings', ratingsRouter);
app.use('/api/scrape', scrapeRouter);
app.use('/api/auth', authRouter);
app.use('/api/groups', groupsRouter);

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

startServer();
