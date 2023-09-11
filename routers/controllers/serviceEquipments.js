const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const {
  addEquipmentsToServiceAPI,
  updateRecordStatus,
} = require("../services/API'S");
const {
  createTransactionIdOrId,
  wherJSONId,
} = require("../sharedFunctions/index");

const addEquipmentsToService = async (req, res) => {
  try {
    // this to add equibment to service
    const {
      transactionId,
      srvMtFacilityServiceId,
      equipment,
      status,
      createdBy,
    } = req.body;
    const equibmentServiceDTO = {
      id: createTransactionIdOrId("SRV-SSE-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SSE-JOR-")
        : transactionId,
      srvMtFacilityServiceId,
      equipment,
      status,
      createdBy,
    };
    let result = await addEquipmentsToServiceAPI(equibmentServiceDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteEquipment = async (req, res) => {
  try {
    let { equipmentId, serviceId } = req.body;

    let result = await updateRecordStatus(
      {
        [Op.and]: [
          wherJSONId("equipment", equipmentId),
          { srvMtFacilityServiceId: serviceId },
          { recordStatus: "LATEST" },
        ],
      },
      "serviceEquipments",
      "DELETED"
    );
    if (result[0] == "0") {
      return res.status(401).json("There is no room with this id ");
    }
    res.json({ equipmentId, serviceId, message: "equipment deleted" });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

module.exports = { addEquipmentsToService, deleteEquipment };
