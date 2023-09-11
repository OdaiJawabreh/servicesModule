const express = require("express");
const { createSettings, getSettings} = require("../controllers/settings");
const settings = express.Router();

settings.post("/createSettings", createSettings);
settings.post("/getSettings", getSettings);

module.exports = settings;
