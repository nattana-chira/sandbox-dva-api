import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import chatRoutes from './modules/chat/chat.routes';
import userRoutes from './modules/user/user.routes';
import friendRoutes from './modules/friend/friend.routes';
import { mainErrorHandlerMiddleware, notFoundErrorHandlerMiddleware } from './utils/errorHandler';

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(chatRoutes);
app.use(userRoutes);
app.use(friendRoutes);

app.use("/uploads", express.static("uploads"));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server is running' })
})

app.use(notFoundErrorHandlerMiddleware)
app.use(mainErrorHandlerMiddleware)

export default app;