const express = require("express");
const {  addRoomToService, deleteRoom} = require("../controllers/serviceRooms");
const serviceRooms = express.Router();

serviceRooms.post("/addRoom", addRoomToService);
serviceRooms.post("/deleteRoom", deleteRoom);


module.exports = serviceRooms