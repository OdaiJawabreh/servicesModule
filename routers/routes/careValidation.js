const express = require("express");
const {  createCareValidation, updateCareValidation, deleteCareValidation , getCareValidation} = require("../controllers/CareValidation");
const {addCareValidationToService, deleteCareValidationFromService} = require("../controllers/serviceCareValidations")
const careValidation = express.Router();

careValidation.post("/createCareValidation", createCareValidation);
careValidation.post("/addCareValidationToService", addCareValidationToService);
careValidation.post("/updateCareValidation", updateCareValidation);
careValidation.post("/deleteCareValidation", deleteCareValidation);
careValidation.post("/deleteCareValidationFromService", deleteCareValidationFromService);
careValidation.post("/getCareValidation", getCareValidation);


module.exports = careValidation;
