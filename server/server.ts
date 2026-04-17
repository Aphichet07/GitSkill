import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from 'express-session';
import cookieParser from 'cookie-parser';
import router from "./routes/route.js";
import passport from "./lib/passport.js";
import connectMongo from "./lib/mongo.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'my-super-secret-key',
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
connectMongo()

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
