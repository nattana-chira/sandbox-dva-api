import { NextFunction, Request, Response } from "express";
import Exception from "./exception";

// Handle 404 Not found
export function notFoundErrorHandlerMiddleware(req: Request, res: Response) {
  res.status(404).json({
    error: {
      status: "error",
      name: "not_found",
      message: 'Route not found',  
      code: 404
    }
  })
}

// Handle all errors
export function mainErrorHandlerMiddleware( 
  err: Error | Exception,
  req: Request,
  res: Response,
  next: NextFunction
) {
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

    const authExceptions = ["UnauthorizedError", "JsonWebTokenError", "TokenExpiredError"]

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
}