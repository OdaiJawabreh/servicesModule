const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { addRoomToServiceAPI, updateRecordStatus } = require("../services/API'S");
const { createTransactionIdOrId, wherJSONId } = require("../sharedFunctions/index");

const addRoomToService = async (req, res) => {
  try {
    // this to add equibment to service
    const {
      transactionId,
      srvMtFacilityServiceId,
      room,
      createdBy,
    } = req.body;
    const roomServiceDTO = {
      id: createTransactionIdOrId("SRV-SSE-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SSE-JOR-")
        : transactionId,
      srvMtFacilityServiceId,
      room,
      createdBy,
    };
    let result = await addRoomToServiceAPI(roomServiceDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteRoom =async (req, res) => {
  try {
    // this to delete a room from service
    let {roomId, serviceId } = req.body;

    let result = await updateRecordStatus(
      {
        [Op.and]: [
          wherJSONId("room", roomId),
          { srvMtFacilityServiceId: serviceId },
          { recordStatus: "LATEST" },
        ],
      },
      "serviceRooms",
      "DELETED"
    );
    if (result[0]=='0'){
      return res.status(401).json("There is no room with this id ")
    }
    res.json({serviceId,roomId, message: 'Room Deleted'});
  } catch (error) {
    res.status(402).json(error.message);
  }
}

module.exports = { addRoomToService, deleteRoom };
