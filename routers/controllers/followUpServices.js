const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { addFollowUpServiceAPI, updateRecordStatus } = require("../services/API'S");
const { createTransactionIdOrId } = require("../sharedFunctions/index");

const addfollowUpService= async (req, res) => {
  try {
    // to add assistance to spacific Service
    const {
      srvMtFacilityServiceId,
      transactionId,
      createdBy,
      service,
      // provider,
      limit,
      duration,
      repetition,
    } = req.body;
    const followUpServiceDTO = {
      id: createTransactionIdOrId("SRV-SSF-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SSF-JOR-")
        : transactionId,
      srvMtFacilityServiceId,
      createdBy,
      service,
      // provider,
      limit,
      duration,
      repetition,
    };
    let result = await addFollowUpServiceAPI(followUpServiceDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const deletFollowUpService = async (req, res) => {
  try {
    // this to delete service from the lists of follow up services 
    let id = req.body.id;
  await  updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "followUpServices",
      "DELETED"
    ),
      res.status(200).json({ message: "follow up service deleted", id });
  } catch (error) {
    res.status(402).json(error.message);
  }
}
const getFollowUpService = async (req, res) => {
  try {
    const {services} = req.body;
    if(!services) return res.status(404).json('no services in body');
    let response = []
    for (let index = 0; index < services.length; index++) {
      const element = services[index];
      let followUpServices = await sequelize.models.followUpServices.findAll({
        where: {
          srvMtFacilityServiceId:  element,
          recordStatus: 'LATEST'
        }
      })
      followUpServices.length ? response.push({
        service: element,
        followUpServices,
      }) : ''
    }
  res.status(200).json(response)
  } catch (error) {
    console.log({
      message: "error in getFollowUpService controller",
      error: error.message
    });
    res.status(402).json({ error: error.message})
  }
}
module.exports = { addfollowUpService, deletFollowUpService, getFollowUpService };
