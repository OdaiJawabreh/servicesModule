const express = require("express");
const {  createPackage, getPackagesByFacility, updatePackage, getPackageById,deletePackage} = require("../controllers/packages");
const {addServiceToPackage, deleteServiceFromPackage} = require("../controllers/packageServices")
const packages = express.Router();

packages.post("/createPackage", createPackage);
packages.post("/addServiceToPackage", addServiceToPackage);
packages.post("/getPackagesByFacility", getPackagesByFacility);
packages.post("/updatePackage", updatePackage);
packages.post("/deleteServiceFromPackage", deleteServiceFromPackage);
packages.post("/getPackageById", getPackageById);
packages.post("/deletePackage", deletePackage);


module.exports = packages;