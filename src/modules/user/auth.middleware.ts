import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import Exception from '../../utils/exception';

const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || ""
    if (!token) 
      throw new Exception(401, "Access denied. No token provided.")
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "")
    res.locals.user = decoded

    next()
  } catch (error) {
    next(error)
  }
}

const auth = {
  required: verifyTokenMiddleware
}

export default auth