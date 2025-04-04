import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import userRoutes from './modules/user/user.routes';
import friendRoutes from './modules/friend/friend.routes';
import Exception from './utils/exception';
import { mainErrorHandlerMiddleware, notFoundErrorHandlerMiddleware } from './utils/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(userRoutes);
app.use(friendRoutes);

app.use("/uploads", express.static("uploads"));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server is running' })
})

app.use(notFoundErrorHandlerMiddleware)
app.use(mainErrorHandlerMiddleware)

export default app;