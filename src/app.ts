import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import userRoutes from './modules/user/user.routes';
import Exception from './utils/exception';

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(userRoutes);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'Server is running' })
})

const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: {
      status: "error",
      name: "not_found",
      message: 'Route not found',  
      code: 404,     
    }
  })
}

app.use(notFoundHandler);

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
        code: errorCode
      }
    }

    const authExceptions = ["UnauthorizedError", "JsonWebTokenError"]

    if (authExceptions.includes(err.name)) {
      errorResponse.error.message = 'missing authorization credentials'
      res.status(401).json(errorResponse)
  
    } else if (err && errorCode) {
      res.status(errorCode).json(errorResponse);
  
    } else if (err) {
      res.status(500).json(errorResponse);
    }
    else {
      res.status(500).json({
        error: {
          status: "error",
          name: "unknown",
          message: "unknown_error",  
          code: 500
        }
      })
    }
  }
})

export default app;