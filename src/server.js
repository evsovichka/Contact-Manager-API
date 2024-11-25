import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { env } from './utils/env.js';
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import routerAuth from './routers/auth.js';
import cookieParser from 'cookie-parser';
import { UPLOADS_DIR } from './constants/index.js';

const PORT = Number(env('PORT', '3000'));

export default function setupServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.use(express.static('uploads'));

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({ message: 'Home Page' });
  });

  app.use('/contacts', contactsRouter);
  app.use('/auth', routerAuth);

  app.use('*', notFoundHandler);

  app.use(errorHandler);

  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}
