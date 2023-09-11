const express = require("express");
const {  addEquipmentsToService, deleteEquipment } = require("../controllers/serviceEquipments");
const serviceEquipments = express.Router();

serviceEquipments.post("/addEquipment", addEquipmentsToService);
serviceEquipments.post("/deleteEquipment", deleteEquipment);


module.exports = serviceEquipments;