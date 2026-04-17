import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/route.js";
import passport from "./lib/passport.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use(router);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
