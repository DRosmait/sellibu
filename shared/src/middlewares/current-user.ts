import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  email: string;
  userName: string;
  phone?: string;
  location?: {
    lat?: number;
    long?: number;
    radius?: number;
  };
  address?: {
    city?: string;
    street?: string;
    country?: string;
    countryCode?: string;
  };
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