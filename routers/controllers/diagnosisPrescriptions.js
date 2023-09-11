const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { addPrescriptionsToDiagnosisAPI, updateRecordStatus } = require("../services/API'S");
const { createTransactionIdOrId } = require("../sharedFunctions/index");

const addPrescriptionsToDiagnosis = async (req, res) => {
  try {
    // to add DIAGNOSIS to spacific Service
    const {
      srvRtServiceDiagnosisId,
      medicine,
      dose,
      duration,
      repetition,
      transactionId,
      createdBy,
    } = req.body;
    const addPrescriptionsDTO = {
      id: createTransactionIdOrId("SRV-SRD-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SRD-JOR-")
        : transactionId,
      createdBy,
      srvRtServiceDiagnosisId,
      medicine,
      dose,
      duration,
      repetition,
    };
    let result = await addPrescriptionsToDiagnosisAPI(addPrescriptionsDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const getPrescriptionsByDiagnosesId = async (req, res) => {
try {
  // this controllers to give all prescreption to spacific service_diagnosis
  let id = req.body.id;
  let prescreption =  await sequelize.models.diagnosisPrescriptions.findAll({
    where: {
      recordStatus: "LATEST",
      srvRtServiceDiagnosisId: id
    }
  })
  res.status(200).send(prescreption)
} catch (error) {
  res.status(400).json(error.message);
}
};

const deletePrescriptions = async (req, res)=> {
  try {
    // this to update record status from latest to deleted
    const id = req.body.id;
    let result = await updateRecordStatus({ id, recordStatus: "LATEST" }, "diagnosisPrescriptions", "DELETED");
    if (result[0]=='0'){
      return res.status(401).json("There is no Prescriptions with this id ")
    }
    res.json({id, message: 'Prescriptions Deleted'});
  } catch (error) {
    res.status(402).json(error.message);
  }
}

module.exports = { addPrescriptionsToDiagnosis, getPrescriptionsByDiagnosesId, deletePrescriptions };
