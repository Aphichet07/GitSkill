import passport from "passport";
import dotenv from "dotenv";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken"; // เพิ่ม import jwt
import { prisma } from "../lib/prisma.js";
import type { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    interface User extends PrismaUser {}
  }
}
dotenv.config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: "http://localhost:8000/auth/github/callback",
      passReqToCallback: true,
    },
    async (
      req: any,
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any,
    ) => {
      console.log("Type of req is:", typeof req);
      console.log("Cookies inside passport:", req.cookies);
      try {
        const token = req.cookies.token;
        console.log("req cookies", req.cookies.token);
        console.log("Cookies : ", token);
        let loggedInUserId = null;

        if (token) {
          try {
            const decoded = jwt.verify(
              token,
              process.env.JWT_SECRET as string,
            ) as any;
            loggedInUserId = decoded.userId;
          } catch (e) {
            console.log("Token expired or invalid, proceeding as new login.");
          }
        }

        if (loggedInUserId) {
          const updatedUser = await prisma.user.update({
            where: { id: Number(loggedInUserId) },
            data: {
              githubId: profile.id,
              githubAccessToken: accessToken,
            },
          });
          return done(null, updatedUser);
        }

        let user = await prisma.user.findUnique({
          where: { githubId: profile.id },
        });

        if (!user) {
          const email =
            profile.emails?.[0]?.value || `${profile.username}@github.com`;

          user = await prisma.user.create({
            data: {
              githubId: profile.id,
              email: email,
              name: profile.displayName || profile.username,
              githubAccessToken: accessToken,
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { githubAccessToken: accessToken },
          });
        }

        return done(null, user);
      } catch (error) {
        console.error("GitHub Strategy Error:", error);
        return done(error as Error, undefined);
      }
    },
  ),
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: "http://localhost:8000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user: any = await prisma.user.findUnique({
          where: { googleId: profile.id },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              email: profile.emails?.[0]?.value || "",
              name: profile.displayName,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user: any = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
