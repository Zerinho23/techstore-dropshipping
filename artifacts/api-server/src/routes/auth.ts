import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/auth/login", (req, res): void => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env["ADMIN_PASSWORD"] ?? "admin1234";

  if (!password || password !== adminPassword) {
    res.status(401).json({ error: "Contraseña incorrecta." });
    return;
  }

  req.session.isAdmin = true;
  res.json({ success: true });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

router.get("/auth/me", (req, res): void => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

export default router;
