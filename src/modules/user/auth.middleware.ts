import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import Exception from '../../utils/exception';
import { config } from '../../config';

const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || ""
    if (!token) 
      throw new Exception(401, "Access denied. No token provided.")
    
    const decoded = jwt.verify(token, config.JWT_SECRET)
    res.locals.auth = decoded

    next()
  } catch (error) {
    next(error)
  }
}

const auth = {
  required: verifyTokenMiddleware
}

export default auth