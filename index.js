const dotenv = require("dotenv");
const { MinecraftServer } = require("./lib/mc-server.js");
dotenv.config();
new MinecraftServer();
