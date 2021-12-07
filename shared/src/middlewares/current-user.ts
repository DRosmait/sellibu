import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
  userName: string;
}

declare global {
  namespace Express {
    interface Request {
      currentUser: UserPayload | null;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const sessionJWT = req.session?.jwt;

  if (!sessionJWT) return next();

  try {
    const payload = jwt.verify(sessionJWT, process.env.JWT_KEY!) as UserPayload;

    req.currentUser = payload;
  } catch (err) {
    req.currentUser = null;
  }

  next();
};
