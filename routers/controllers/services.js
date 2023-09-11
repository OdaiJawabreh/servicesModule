const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { createServiceApi } = require("../services/API'S");
const {
  createTransactionIdOrId,
  findEntity,
  updateRecordStatus,
  wherINJSON,
  wherJSONIdDynamic
} = require("../sharedFunctions/index");

const createService = async (req, res) => {
  // this to Add service At all (general ) => not connected with any facility
  try {
    const { name, description, type, riskLevel, createdBy, transactionId, status,fieldType } =
      req.body;
    const serviceDTO = {
      id: createTransactionIdOrId("SRV-SRP-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SRP-JOR-")
        : transactionId,
      name,
      description,
      type,
      riskLevel,
      status,
      createdBy,
      fieldType
    };
    let response = await createServiceApi(serviceDTO);
    res.status(200).json(response);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const updateService = async (req, res) => {
  try {
    // this Api to update main info about the service
    const { id, name, description, type, riskLevel, createdBy, transactionId, status } =
      req.body;

    // this to current entity based on id
    let lastEntity = await findEntity(
      { id, recordStatus: "LATEST" },
      "service"
    );
    // to check there is address with this id
    if (!lastEntity) {
      return res.status(401).json("No service With this id");
    }
    const serviceDTO = {
      id,
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SRP-JOR-")
        : transactionId,
      name: name || lastEntity.name,
      description: description || lastEntity.description,
      type: type || lastEntity.type,
      riskLevel: riskLevel || lastEntity.riskLevel,
      status: status || lastEntity.status,
      createdBy: createdBy || lastEntity.createdBy,
      fieldType: lastEntity.fieldType
    };
    await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "service",
      "UPDATED"
    ); // To update latest record status entity
    let response = await createServiceApi(serviceDTO);
    res.status(200).json(response);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const getMainServices = async (req, res) => {
  try {
    // this to get all main services to conncted it with addProviderToService
    let { limit, offset } = req.body;
    if (limit && offset) {
      limit = limit * 1;
      offset = (offset * 1 - 1) * limit;
      let response = await getResponsePaggination(req, limit, offset);
      // if thers no services
      if (!response.rows.length) {
        return res.status(200).json(response);
      }
      // now i will go to find all post and pre action and diagnosis for spacific service
      let result = await getActionsAndDiagnosis(response.rows);
      response.rows = [...result];
      return res.status(200).json(response);
    } else {
      let response = await getResponseWithoutPaggination(req);
      // if thers no services
      if (!response.length) {
        return res.status(200).json(response);
      }
      // now i will go to find all post and pre action and diagnosis for spacific service
      let result = await getActionsAndDiagnosis(response);
  
      return res.status(200).json(result);
    }
  } catch (error) {
    res.status(402).json(error.message);
  }
};
module.exports = {
  createService,
  updateService,
  getMainServices,
};

const getResponsePaggination = async (req, limit, offset) => {
  try {
    const key  = req.headers["workspace-field"]
    // console.log('====================================');
    // console.log("key from headers => " , key);
    // console.log('====================================');
    let { name, type, riskLevel, status } = req.body;
    let services = await sequelize.models.service.findAndCountAll({
      where: {
        [Op.and]: [
          status ? {status: status} : '',
          name
            ? {
                [Op.or]: [
                  wherINJSON("name", "like", "en", name),
                  wherINJSON("name", "like", "ar", name),
                ],
              }
            : "",
          type ? wherINJSON("type", "in", "id", type) : "",
          riskLevel ? wherINJSON("risk_level", "in", "id", riskLevel) : "",
          {[Op.or]:[
            wherJSONIdDynamic("field_type", key, "key"),
            wherJSONIdDynamic("field_type", key, "field")
          ]},
          { recordStatus: "LATEST" },
        ],
      },
      limit,
      offset,
    });
    return { pages: Math.ceil(services.count / limit), ...services };
  } catch (error) {
    throw error;
  }
};
const getResponseWithoutPaggination = async (req) => {
  try {
    const key  = req.headers["workspace-field"]
    // console.log('====================================');
    // console.log("key from headers => " , key);
    // console.log('====================================');
    let { name, type, riskLevel, status } = req.body;
    let services = await sequelize.models.service.findAll({
      where: {
        [Op.and]: [
          status ? {status: status} : '',

          name
            ? {
                [Op.or]: [
                  wherINJSON("name", "like", "en", name),
                  wherINJSON("name", "like", "ar", name),
                ],
              }
            : "",
          type ? wherINJSON("type", "in", "id", type) : "",
          riskLevel ? wherINJSON("risk_level", "in", "id", riskLevel) : "",
          // wherINJSON("field_type", "eq", "key", key),
          {[Op.or]:[
            wherJSONIdDynamic("field_type", key, "key"),
            wherJSONIdDynamic("field_type", key, "field")
          ]},
          { recordStatus: "LATEST" },
        ],
      },
    });
    return services
  } catch (error) {
    throw error;
  }
};

const getActionsAndDiagnosis = async (services) => {
  try {
    // fierst i will search in service_diagnosis table
    let array = [];
    for (let index = 0; index < services.length; index++) {
      const element = services[index];
      let diagnosis = await sequelize.models.serviceDiagnosis.findAll({
        where: {
          recordStatus: "LATEST",
          srvMtFacilityServiceId: element.id,
        },
      });
      // now i want to get all care Validation for service
      let preCare = [];
      let postCare = [];
      let preValidation = [];
      let postValidation = [];

      let vareValidation =
        await sequelize.models.serviceCareValidations.findAll({
          where: {
            recordStatus: "LATEST",
            srvMtFacilityServiceId: element.id,
          },
          attributes: ["srvMtCareValidationId"],
        });
      vareValidation = vareValidation.map(
        (careVal) => careVal.srvMtCareValidationId
      );

      let response = await Promise.all(
        vareValidation.map((id) =>
          sequelize.models.careValidation.findOne({
            where: { id, recordStatus: "latest" },
          })
        )
      );
      response.forEach((element) => {
        element.type.id == 1 && element.time.id == 1
          ? preCare.push(element)
          : element.type.id == 1 && element.time.id == 2
          ? postCare.push(element)
          : element.type.id == 2 && element.time.id == 1
          ? preValidation.push(element)
          : element.type.id == 2 && element.time.id == 2
          ? postValidation.push(element)
          : "";
      });

      array.push({
        ...element.dataValues,
        diagnosis,
        preCare,
        postCare,
        preValidation,
        postValidation,
      });
    }
    return array;
  } catch (error) {
    throw error;
  }
};
