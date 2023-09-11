const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const {
  addCareValidationToServiceAPI,
  updateRecordStatus,
} = require("../services/API'S");
const { createTransactionIdOrId } = require("../sharedFunctions/index");

const addCareValidationToService = async (req, res) => {
  try {
    // this to connect care validation to spacific service
    const {
      srvMtFacilityServiceId,
      srvMtCareValidationId,
      transactionId,
      createdBy,
    } = req.body;
    const serviceCareValidationDTO = {
      id: createTransactionIdOrId("SRV-SRV-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SRV-JOR-")
        : transactionId,
      createdBy,
      srvMtFacilityServiceId,
      srvMtCareValidationId,
    };
    let result = await addCareValidationToServiceAPI(serviceCareValidationDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteCareValidationFromService = async (req, res) => {
  try {
    // this to delete sapcific record from service_care_valiadtion table and
    const { srvMtCareValidationId, srvMtFacilityServiceId } = req.body;
    let result = await updateRecordStatus(
      { srvMtCareValidationId, srvMtFacilityServiceId, recordStatus: "LATEST" },
      "serviceCareValidations",
      "DELETED"
    );
    if (result[0] == "0")
      return res.status(401).json("There is no Care Validation with this id ");
    res.status(200).json({ srvMtCareValidationId, message: "deleted" });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

module.exports = {
  addCareValidationToService,
  deleteCareValidationFromService,
};
