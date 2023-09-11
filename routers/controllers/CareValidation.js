const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const {
  createCareValidationApi,
  findEntity,
  updateRecordStatus,
} = require("../services/API'S");
const {
  createTransactionIdOrId,
  wherJSONIdDynamic,
} = require("../sharedFunctions/index");

const createCareValidation = async (req, res) => {
  try {
    /* this API to add general CARE OR VALIDATION  */
    const {
      transactionId,
      createdBy,
      subject,
      description,
      type,
      time,
      ageFrom,
      ageTo,
      gender,
      maritalStatus,
      pregnant,
      goal
    } = req.body;
    const careValidationDTO = {
      id: createTransactionIdOrId("SRV-SCV-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SCV-JOR-")
        : transactionId,
        subject,
      description,
      createdBy,
      type,
      time,
      ageFrom,
      ageTo,
      gender,
      maritalStatus,
      pregnant,
      goal
    };
    let category = await createCareValidationApi(careValidationDTO);
    res.status(200).json(category);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const updateCareValidation = async (req, res) => {
  try {
    // this to update any care validation in general
    const {
      id,
      transactionId,
      createdBy,
      subject,
      description,
      type,
      time,
      ageFrom,
      ageTo,
      gender,
      maritalStatus,
      pregnant,
      goal
    } = req.body;
    // this to current entity based on id
    let lastEntity = await findEntity(
      { id, recordStatus: "LATEST" },
      "careValidation"
    );
    // to check there is package with this id
    if (!lastEntity)
      return res.status(401).json("No Care Validation found With this id");
    const careValidationDTO = {
      id,
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SCV-JOR-")
        : transactionId,
      description: description || lastEntity.description,
      createdBy: createdBy || lastEntity.createdBy,
      type: type || lastEntity.type,
      time: time || lastEntity.time,
      ageFrom: ageFrom || lastEntity.ageFrom,
      ageTo: ageTo || lastEntity.ageTo,
      gender: gender || lastEntity.gender,
      maritalStatus: maritalStatus || lastEntity.maritalStatus,
      pregnant: pregnant || lastEntity.pregnant,
      goal: goal || lastEntity.goal,
      subject: subject || lastEntity.subject,
    };
    await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "careValidation",
      "UPDATED"
    ); // update Record Status

    let result = await createCareValidationApi(careValidationDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const deleteCareValidation = async (req, res) => {
  try {
    // this to delete Care Validation and i will delete any record from service_care_validation related to the same ID
    const id = req.body.id;
    let result = await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "careValidation",
      "DELETED"
    );
    let deleteService = await updateRecordStatus(
      { srvMtCareValidationId: id, recordStatus: "LATEST" },
      "serviceCareValidations",
      "DELETED"
    );
    if (result[0] == "0" && deleteService[0]== "0")
      return res.status(401).json("There is no Care Validation with this id ");
    // now im going to delete any service connect with the same id
    await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "serviceCareValidations",
      "DELETED"
    );

    res.status(200).json({
      id,
      message:
        "Delete  care validatin with and delete any service related to it",
    });
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const getCareValidation = async (req, res) => {
  try {
    let { time, type } = req.body;
    let response = await sequelize.models.careValidation.findAll({
      where: {
        [Op.and]: [
          time ? wherJSONIdDynamic("time", time, "id") : "",
          type ? wherJSONIdDynamic("type", type, "id") : "",
          { recordStatus: "LATEST" },
        ],
      },
    });
    res.status(200).json(response);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

module.exports = {
  createCareValidation,
  updateCareValidation,
  deleteCareValidation,
  getCareValidation,
};
