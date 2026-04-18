import { Router } from "express";
import type { Request, Response } from "express";
import AuthController from "../controllers/auth.controller.js";
import passport from "../lib/passport.js";
const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Welcome to auth" });
});
router.get("/status", (req: Request, res: Response) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.status(200).json({
      isAuthenticated: true,
      user: req.user,
    });
  } else {
    return res.status(200).json({
      isAuthenticated: false,
      user: null,
    });
  }
});
router.post("/register", AuthController.handleRegister);
router.post("/login", AuthController.handleLogin);
router.get(
  "/google/auth",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  AuthController.handleCallbackGoogle,
);

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email", "repo"],
    session: false,
  }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    AuthController.handleCallbackGitHub(req, res);
  },
);
export default router;
