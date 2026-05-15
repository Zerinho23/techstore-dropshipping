import type { Request, Response, NextFunction } from "express";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.isAdmin) {
    res.status(401).json({ error: "No autorizado. Debes iniciar sesión como administrador." });
    return;
  }
  next();
}
