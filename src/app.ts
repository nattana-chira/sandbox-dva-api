import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import userRoutes from './modules/user/user.routes';
import Exception from './utils/Exception';

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(userRoutes);

app.use('/', (req, res) => {
  res.status(200).json({ status: 'Server is running' })
});

app.use((
  err: Error | Exception,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);

  if (err) {
    // @ts-ignore
    const errorCode = err?.errorCode
    const errorResponse = {
      error: {
        status: "error",
        name: err?.name || "unknown",
        message: err.message,  
        code: errorCode,     
      }
    }

    if (err.name === 'UnauthorizedError') {
      errorResponse.error.message = 'missing authorization credentials'
      res.status(401).json(errorResponse)
  
    } else if (err && errorCode) {
      res.status(errorCode).json(errorResponse);
  
    } else if (err) {
      res.status(500).json(errorResponse);
    }
  }
});

export default app;