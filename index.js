const express = require("express");
const Server = require("./server");

const app = express();
new Server(app);