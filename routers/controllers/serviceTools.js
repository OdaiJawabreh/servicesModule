const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { addtoolsToServiceAPI, updateRecordStatus } = require("../services/API'S");
const { createTransactionIdOrId } = require("../sharedFunctions/index");

const addtoolsService = async (req, res) => {
  try {
    // this api to add tools from inventory feature to spacific service
    const {
      srvMtFacilityServiceId,
      category,
      tool,
      status,
      createdBy,
      transactionId,
    } = req.body;

    const serviceToolsDTO = {
      id: createTransactionIdOrId("SRV-SST-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SST-JOR-")
        : transactionId,
      srvMtFacilityServiceId,
      category,
      tool,
      status,
      createdBy,
    };
    let response = await addtoolsToServiceAPI(serviceToolsDTO);
    res.status(200).json(response);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const deleteTools = (req, res) => {
  try {
    // this to delete tools from service
    let id = req.body.id;
    updateRecordStatus(
      {  id, recordStatus: "LATEST" },
      "serviceTools",
      "DELETED"
    ),
    res.status(200).json({ message: "tools deleted", id });

  } catch (error) {
    res.status(402).json(error.message);
    
  }
}
module.exports = { addtoolsService, deleteTools };
