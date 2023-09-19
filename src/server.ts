import express from "express";
import { errorHandler } from "./errors";
import cors from "cors";
import userRouter from "./routes/userRoutes";
import "express-async-errors";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", userRouter);

app.use(errorHandler);

app.listen(3000, () =>
  console.log(`Server running on port 3000 at http://localhost:3000`)
);
