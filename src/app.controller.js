import connectDB from "./db/connection.js";
import authController from "./modules/auth/auth.controller.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import cors from "cors";


const bootstrap = (app, express) => {
  app.use(express.json());
  app.use(cors());
  
  app.get("/", (req, res, next) => {
    return res.status(200).json({ message: "hello" });
  });

  app.use("/auth", authController);

  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "not found" });
  });

  app.use(globalErrorHandling);

  // db connection
  connectDB();
};

export default bootstrap;
