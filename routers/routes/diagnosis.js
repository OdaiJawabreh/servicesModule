const express = require("express");
const {  createDiagnosis, deleteDiagnosis , getAllDiagnosis} = require("../controllers/diagnosis");
const {addDiagnosisToService, deleteDiagnosisFromService} = require("../controllers/serviceDiagnosis");
const {addPrescriptionsToDiagnosis, getPrescriptionsByDiagnosesId, deletePrescriptions} = require("../controllers/diagnosisPrescriptions");
const diagnosis = express.Router();

diagnosis.post("/createDiagnosis", createDiagnosis);
diagnosis.post("/addDiagnosisToService", addDiagnosisToService);
diagnosis.post("/addPrescriptionsToDiagnosis", addPrescriptionsToDiagnosis);
diagnosis.post("/getPrescriptionsByDiagnosesId", getPrescriptionsByDiagnosesId);
diagnosis.post("/deleteDiagnosis", deleteDiagnosis);
diagnosis.post("/deleteDiagnosisFromService", deleteDiagnosisFromService);
diagnosis.post("/deletePrescriptions", deletePrescriptions);
diagnosis.post("/getAllDiagnosis", getAllDiagnosis);

module.exports = diagnosis;