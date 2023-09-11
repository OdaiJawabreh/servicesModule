const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const {
  addProviderToServiceAPI,
  findEntity,
  updateRecordStatus,
} = require("../services/API'S");
const {
  createTransactionIdOrId,
  wherJSONId,
} = require("../sharedFunctions/index");

const addProvider = async (req, res) => {
  try {
    // to add assistance to spacific Service
    const {
      srvMtFacilityServiceId,
      provider,
      price,
      transactionId,
      createdBy,
      // billing
      name,
      facility,
    } = req.body;
    const serviceProviderDTO = {
      id: createTransactionIdOrId("SRV-SSP-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SSP-JOR-")
        : transactionId,
      srvMtFacilityServiceId,
      provider,
      price,
      createdBy,
      // billing
      name,
      facility,
    };
    await addProviderToServiceAPI(serviceProviderDTO);
    res.status(200).json(serviceProviderDTO);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const updateProvider = async (req, res) => {
  try {
    // this to update provider details in sapcific service
    const { transactionId, createdBy, service, provider, price } = req.body;
    if( service && provider && price){

    let lastEntity = await findEntity(
      {
        [Op.and]: [
          wherJSONId("provider", provider.id),
          { srvMtFacilityServiceId: service.id },
          { recordStatus: "LATEST" },
        ],
      },
      "serviceProviders"
    );
    // to check there is address with this id
    if (!lastEntity) {
      return res
        .status(401)
        .json("No provider With this id belong to the service");
    }
    await updateRecordStatus(
      {
        [Op.and]: [
          wherJSONId("provider", provider.id),
          { srvMtFacilityServiceId: service.id },
          { recordStatus: "LATEST" },
        ],
      },
      "serviceProviders",
      "UPDATED"
    );
    const serviceProviderDTO = {
      id: lastEntity.id,
      transactionId: transactionId || lastEntity.transactionId,
      srvMtFacilityServiceId: lastEntity?.srvMtFacilityServiceId,
      provider: provider || lastEntity.provider,
      price: price || price.provider,
      createdBy: createdBy || lastEntity.createdBy,
    };
    let result = await addProviderToServiceAPI(serviceProviderDTO);
    res.status(200).json(result);
    }
    else{
      res.status(401).json("something wrong");
    }
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteProvider = async (req, res) => {
  try {
    // to delete provider in service
    // console.log('here');
    const { providerId, serviceId } = req.body;
    //   delete provider from the service
    let result = await updateRecordStatus(
      {
        [Op.and]: [
          wherJSONId("provider", providerId),
          { srvMtFacilityServiceId: serviceId },
          { recordStatus: "LATEST" },
        ],
      },
      "serviceProviders",
      "DELETED"
    );
    // delete any record in package_service with the provider and this service
    let result2 = await updateRecordStatus(
      {
        [Op.and]: [
          wherJSONId("provider", providerId),
          wherJSONId("service", serviceId),

          { recordStatus: "LATEST" },
        ],
      },
      "packageServices",
      "DELETED"
    );
    // console.log(result)
    if (result[0] == "0" ) {
      // return res.status(401).json("There is no Provider with this id ");
    }
    res.status(200).json({
      providerId,
      serviceId,
      message: `delete Provider from this service`,
    });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

module.exports = { addProvider, updateProvider, deleteProvider };
