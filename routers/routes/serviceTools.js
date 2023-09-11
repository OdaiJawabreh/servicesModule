const express = require("express");
const {  addtoolsService, deleteTools } = require("../controllers/serviceTools");
const serviceTools = express.Router();

serviceTools.post("/addtools", addtoolsService);
serviceTools.post("/deleteTools", deleteTools);


module.exports = serviceTools;