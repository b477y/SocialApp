import path from "node:path";
import connectDB from "./db/connection.js";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import postController from "./modules/post/post.controller.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import cors from "cors";

const bootstrap = (app, express) => {
  app.use(cors());
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  app.use(express.json());

  app.use("/auth", authController);
  app.use("/user", userController);
  app.use("/post", postController);

  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "not found" });
  });

  app.use(globalErrorHandling);

  connectDB();
};

export default bootstrap;
