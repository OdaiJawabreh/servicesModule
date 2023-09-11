const express = require("express");
const {  addAssistent, deleteAssistent } = require("../controllers/serviceAssistants");
const serviceAssistants = express.Router();

serviceAssistants.post("/addAssistent", addAssistent);
serviceAssistants.post("/deleteAssistent", deleteAssistent);


module.exports = serviceAssistants;