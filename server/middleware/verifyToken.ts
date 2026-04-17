import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userPayload?: {
        userId: number;
        email: string;
      };
    }
  }
}

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.access_token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No token provided. Please login." });
  }

  try {
    const secret = process.env.JWT_SECRET || "fallback-super-secret-key";
    const decoded = jwt.verify(token, secret) as {
      userId: number;
      email: string;
    };

    req.userPayload = decoded;

    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid or expired token." });
  }
};

export default verifyToken;
