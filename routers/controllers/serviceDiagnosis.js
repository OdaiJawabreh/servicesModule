const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const {
  addDiagnosisToServiceAPI,
  updateRecordStatus,
} = require("../services/API'S");
const { createTransactionIdOrId } = require("../sharedFunctions/index");

const addDiagnosisToService = async (req, res) => {
  try {
    // to add DIAGNOSIS to spacific Service
    const { srvMtFacilityServiceId, diagnosis, transactionId, createdBy } =
      req.body;
    const diagnosisServiceDTO = {
      id: createTransactionIdOrId("SRV-SRD-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SRD-JOR-")
        : transactionId,
      createdBy,
      srvMtFacilityServiceId,
      diagnosis,
    };
    let result = await addDiagnosisToServiceAPI(diagnosisServiceDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteDiagnosisFromService = async (req, res) => {
  try {
    // this to delete diagnoseswithPres from service and if we delete it will delete any prescription linked to it
    let id = req.body.id;

    await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "serviceDiagnosis",
      "DELETED"
    );
    await updateRecordStatus(
      { srvRtServiceDiagnosisId: id, recordStatus: "LATEST" },
      "diagnosisPrescriptions",
      "DELETED"
    );

    res
      .status(200)
      .json({ id, message: "diagnosis Deleted with all prescription details" });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

module.exports = { addDiagnosisToService, deleteDiagnosisFromService };
