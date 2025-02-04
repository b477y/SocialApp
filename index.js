import path from "node:path";
import express from "express";
import bootstrap from "./src/app.controller.js";
import * as dotenv from "dotenv";
// import { roleTypes } from "./src/db/models/User.model.js";

dotenv.config({ path: path.resolve("./src/config/.env.dev") });

const app = express();
const PORT = process.env.PORT;

bootstrap(app, express);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// console.log(Object.values(roleTypes));
