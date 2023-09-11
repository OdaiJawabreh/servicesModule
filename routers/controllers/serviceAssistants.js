const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { addAssistentToServiceAPI, updateRecordStatus } = require("../services/API'S");
const { createTransactionIdOrId, wherJSONId } = require("../sharedFunctions/index");

const addAssistent = async (req, res) => {
  try {
    // to add assistance to spacific Service
    const { srvMtFacilityServiceId, name, assistant, transactionId, createdBy } =
      req.body;
    const serviceAssistantsDTO = {
      id: createTransactionIdOrId("SRV-SSE-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SSE-JOR-")
        : transactionId,
      srvMtFacilityServiceId,
      assistant,
      name,
      createdBy,
    };
    let result = await addAssistentToServiceAPI(serviceAssistantsDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const deleteAssistent = async (req, res) => {
  try {
    // to delete provider in service
    const { assistanceId, serviceId } = req.body;

    let result = await updateRecordStatus(
      {
        [Op.and]: [
          wherJSONId("assistant", assistanceId),
          { srvMtFacilityServiceId: serviceId },
          { recordStatus: "LATEST" },
        ],
      },
      "serviceAssistances",
      "DELETED"
    );
    if (result[0] == "0") {
      return res.status(401).json("There is no assistant with this id ");
    }
   res.status(200).json({assistanceId,serviceId, message: `delete assistant from this service`})
  } catch (error) {
    res.status(402).json(error.message);
  }
};
module.exports = { addAssistent, deleteAssistent };
