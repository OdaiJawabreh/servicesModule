const express = require("express");
const {
    deleteProviderAssistantServices
} = require("../controllers/facilityService");
const facilitytService = express.Router();

facilitytService.post("/deleteProviderServices", deleteProviderAssistantServices);

module.exports = facilitytService;
