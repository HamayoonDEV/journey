import express from "express";
import { PORT } from "./config/index.js";
import connectDb from "./Database/index.js";
import router from "./Routes/index.js";
import errorHandler from "./middleWare/errorHander.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());
connectDb();
app.use(express.json({ limit: "50mb" }));
app.use(router);
app.use("/storage", express.static("storage"));
app.use(errorHandler);
app.listen(PORT, console.log(`server is running on PORT:${PORT}`));
