import path from "node:path";
import connectDB from "./db/connection.js";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import postController from "./modules/post/post.controller.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import cors from "cors";
import { createHandler } from "graphql-http/lib/use/express";
import { successResponse } from "./utils/response/success.response.js";
import playground from "graphql-playground-middleware-express";
import { schema } from "./modules/app.graph.js";
import { limiter } from "./utils/security/limiter.js";

const bootstrap = (app, express) => {
  app.use(cors());
  app.use(limiter);
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  app.use(express.json());

  app.get("/playground", playground.default({ endpoint: "/graphql" }));
  app.use("/graphql", createHandler({ schema }));
  app.get("/", (req, res, next) => {
    successResponse({
      res,
      status: 200,
      message: "Welcome to the Social media app",
    });
  });

  app.use("/auth", authController);
  app.use("/user", userController);
  app.use("/post", postController);

  app.all("*", (req, res, next) => {
    return res.status(404).json({ message: "In-valid routing" });
  });

  app.use(globalErrorHandling);

  connectDB();
};

export default bootstrap;
