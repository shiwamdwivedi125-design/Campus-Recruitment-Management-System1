import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export type AuthUser = {
  id: string;
  email: string;
  isAdmin: boolean;
};

export function signToken(user: AuthUser) {
  return jwt.sign(
    { sub: user.id, email: user.email, isAdmin: user.isAdmin },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as {
      sub: string;
      email: string;
      isAdmin: boolean;
    };
    req.user = { id: payload.sub, email: payload.email, isAdmin: payload.isAdmin };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
