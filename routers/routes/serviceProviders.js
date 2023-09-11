const express = require("express");
const {  addProvider, updateProvider, deleteProvider} = require("../controllers/serviceProviders");
const serviceProviders = express.Router();

serviceProviders.post("/addProvider", addProvider);
serviceProviders.post("/updateProvider", updateProvider);
serviceProviders.post("/deleteProvider", deleteProvider);


module.exports = serviceProviders;