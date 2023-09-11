const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { createSettingsAPI } = require("../services/API'S");
const { createTransactionIdOrId } = require("../sharedFunctions/index");

const createSettings = async (req, res) => {
  try {
    // this Api to define all Setting in the service feature
    const {
      transactionId,
      serviceType,
      serviceLocation,
      validationType,
      validationTime,
      serviceCareValidationGoals,
      packageType,
      createdBy,
    } = req.body;
    const settingsDTO = {
      id: createTransactionIdOrId("SRV-SRS-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SRS-JOR-")
        : transactionId,
      serviceType,
      serviceLocation,
      validationType,
      validationTime,
      serviceCareValidationGoals,
      packageType,
      createdBy,
    };
    let response = await createSettingsAPI(settingsDTO);
    res.status(200).json(response);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const getSettings = async (req, res) => {
    try {
        // this to give me access to all seetings
        let settings = await sequelize.models.settings.findOne({
          where: {
            recordStatus: "LATEST",
          }
        })
    res.status(200).json(settings);

    } catch (error) {
    res.status(402).json(error.message);
        
    }
}

module.exports = { createSettings, getSettings };
