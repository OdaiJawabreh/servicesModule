const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const {
  addServiceToPackageAPI,
  updateRecordStatus,
} = require("../services/API'S");
const { createTransactionIdOrId } = require("../sharedFunctions/index");

const addServiceToPackage = async (req, res) => {
  try {
    // to add service to spacific Package
    const {
      transactionId,
      createdBy,
      srvMtPackageId,
      service,
      provider,
      quantity,
      price
    } = req.body;
    const packageServiceDTO = {
      id: createTransactionIdOrId("SRV-SPS-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SPS-JOR-")
        : transactionId,
      createdBy,
      srvMtPackageId,
      service,
      provider,
      quantity,
    };
    let result = await addServiceToPackageAPI(packageServiceDTO);
    res.status(200).json({
      ...result.dataValues,
      price
    });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteServiceFromPackage = async (req, res) => {
  try {
    // this to delete spacific Service from package  (Soft Delete) => change recoed status frpm latest to Deleted
    const { id, packageId, providerId, serviceId } = req.body;
    let result = await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "packageServices",
      "DELETED"
    );
    if (result[0] == "0") {
      return res.status(401).json("There is no attachmrnt with this id ");
    }
    res.json({
      id,
      packageId,
      providerId,
      serviceId,
    });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

module.exports = { addServiceToPackage, deleteServiceFromPackage };
