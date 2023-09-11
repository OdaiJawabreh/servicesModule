const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { createDiagnosisApi, updateRecordStatus } = require("../services/API'S");
const {
  createTransactionIdOrId,
  wherJSONId,
} = require("../sharedFunctions/index");

const createDiagnosis = async (req, res) => {
  try {
    /* this to create general diagnosis */
    const { name, description, transactionId, createdBy } = req.body;
    const diagnosisDTO = {
      id: createTransactionIdOrId("SRV-SRC-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SRC-JOR-")
        : transactionId,
      createdBy,
      name,
      description,
    };
    let result = await createDiagnosisApi(diagnosisDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteDiagnosis = async (req, res) => {
  try {
    /* this to delete main diagnoses and keep in mind that if you are delete diagnoses you should delete any service cinnected with this diagnosis   */
    let id = req.body.id;

    let result = await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "diagnosis",
      "DELETED"
    );
    if (result[0] == "0") {
      return res.status(401).json("There is no Diagnosis with this id ");
    }
    // now im going to delete every diagnosis_service with this diagnosis
    await updateRecordStatus(
      { [Op.and]: [wherJSONId("diagnosis", id), { recordStatus: "LATEST" }] },
      "serviceDiagnosis",
      "DELETED"
    );
    res.status(200).json({
      id,
      message: "Diagnosis deleted and deleted from any service used it",
    });
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const getAllDiagnosis = async (req, res) => {
  try {
    // to get all diagnoses when connet it to facility service
    let diagnosis = await sequelize.models.diagnosis.findAll({
      where: {
        recordStatus: "LATEST",
      },
    });
    res.status(200).json(diagnosis);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

module.exports = { createDiagnosis, deleteDiagnosis, getAllDiagnosis };
