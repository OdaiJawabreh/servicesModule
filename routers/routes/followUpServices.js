const express = require("express");
const {  addfollowUpService, deletFollowUpService, getFollowUpService } = require("../controllers/followUpServices");
const followUpServices = express.Router();

followUpServices.post("/addFollowUp", addfollowUpService);
followUpServices.post("/deletFollowUpService", deletFollowUpService);
followUpServices.post("/getFollowUpService", getFollowUpService);


module.exports = followUpServices;