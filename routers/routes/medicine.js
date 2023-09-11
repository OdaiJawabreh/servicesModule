const express = require("express");
const {  createMedicine, deleteMidicine } = require("../controllers/medicine");
const medicine = express.Router();

medicine.post("/createMedicine", createMedicine);
medicine.post("/deleteMidicine", deleteMidicine);

module.exports = medicine;