const express = require("express");
const { createService, updateService, getMainServices} = require("../controllers/services");
const {
  getServices,
  getFullViewService,
  addServiceToFacility,
  updateServiceFacility,
  deleteService,
} = require("../controllers/facilityService");

const services = express.Router();

services.post("/createService", createService);
services.post(
  "/getServices",
  getServices
);
services.post("/getFullViewService", getFullViewService);
services.post("/updateService", updateService);
services.post("/addServiceToFacility", addServiceToFacility);
services.post("/updateFacilityService", updateServiceFacility);
services.post("/deleteService", deleteService);
services.post("/getMainServices", getMainServices);

module.exports = services;
