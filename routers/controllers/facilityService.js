const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const { addServiceToFacilityApi, findEntity, updateRecordStatus } = require("../services/API'S");
const { createTransactionIdOrId, wherJSONId, wherJSONIdDynamic, wherINJSON, wherJSONLike, arrayOfIds } = require("../sharedFunctions/index");
const { dispatcher } = require("../sharedFunctions/requestBilder");

const addServiceToFacility = async (req, res) => {
  // this Api to add general service with spacific details to spacific Facility
  try {
    const { transactionId, srvMtServiceId, category, facility, duration, needAssistant, status, location, createdBy, image } = req.body;
    srvMtServiceId.name.en = srvMtServiceId?.name?.en.toLowerCase();
    srvMtServiceId.name.ar = srvMtServiceId?.name?.ar.toLowerCase();
    const serviceFacilityDTO = {
      id: createTransactionIdOrId("SRV-SFS-JOR-"),
      transactionId: !transactionId ? createTransactionIdOrId("TRN-SRV-SFS-JOR") : transactionId,
      srvMtServiceId,
      category,
      facility,
      duration,
      needAssistant,
      status,
      location,
      createdBy,
      image
    };
    let response = await addServiceToFacilityApi(serviceFacilityDTO);
    res.status(200).json(response);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const getServices = async (req, res) => {
  /* this API to find all services with bacic Info catorize under parents category in facility hierarchy
1. i will find the pareNT category for this service then i will give all services under this category
 */
  try {
    const { facilities, category, name, status, language, providers } = req.body;
    // i will difined empty array to push service id based on providers
    let idsServiceBasedOnProviders = [];
    providers ? (idsServiceBasedOnProviders = await getServiceByProviders(providers)) : "";

    let final_categories_ids = [];
    let finalResponse = {};
    let parents = await sequelize.models.facilityCategory.findAll({
      where: {
        [Op.and]: [facilities ? wherINJSON("facility", "in", "id", facilities) : "", category ? { id: category } : wherJSONIdDynamic("category", "null", "parentId.id"), { recordStatus: "LATEST" }],
      },
    }); // now i have the  Category
    let test = parents.map(el => el.id)
    console.log(`test=> `, test);
    if (!parents.length) return res.status(200).json([]);
    final_categories_ids = parents.map((ele, i) => {
      finalResponse[i] = { name: "", services: [] };
      finalResponse[i].name = ele.category.name;
      return [];
    });
    for (let i = 0; i < parents.length; i++) {
      await getSubCategories(parents[i].category.id, final_categories_ids[i], facilities);
      final_categories_ids[i].push(parents[i].category.id); // to add main category because the main category could service belong to it
    }
    for (let i = 0; i < final_categories_ids.length; i++) {
      let arrayOfIds = await findIds(final_categories_ids[i], facilities);
      let services = await getServiceByCategory(arrayOfIds, name, status, language, providers ? idsServiceBasedOnProviders : null );
      finalResponse[i].services = services;
    }
    let arr = [];
    for (const property in finalResponse) {
      arr.push({
        name: finalResponse[property].name,
        services: finalResponse[property].services,
      });
    }
    res.status(200).send(arr);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const getFullViewService = async (req, res) => {
  try {
    // this to get full view service (tools, equipment, room, diagnosis with prescription, follow up services, packages for service, etc...)
    const id = req.body.id;
    // first general info about the service
    let service = await getService(id);
    // now i will the following (service Details, provider, assistance, follow up service, diagnosis with prescription, packages for service, etc...)
    const [serviceInfo, providers, serviceTools, assistances, equipmemts, rooms, followUp, packages, diagnosis, careValidation] = await Promise.all([
      getServiceInfo(service.srvMtServiceId.id),
      getServiceProviders(service.id),
      getServiceTools(service.id),
      getAssistents(service.id),
      getEquipmemts(service.id),
      getRooms(service.id),
      getFollowUp(service.id),
      getPackages(service.id),
      getDiagnosis(service.id),
      getCareValidation(service.id),
    ]);

    res.status(200).json({
      service,
      serviceInfo,
      providers,
      serviceTools,
      assistances,
      equipmemts,
      rooms,
      followUp,
      packages,
      diagnosis,
      careValidation,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
};

const updateServiceFacility = async (req, res) => {
  try {
    // this Api to update service_facility

    const { id, transactionId, srvMtServiceId, category, facility, duration, needAssistant, status, location, createdBy, image } = req.body;

    // this to current entity based on id
    let lastEntity = await findEntity({ id, recordStatus: "LATEST" }, "facilityService");
    // to check there is address with this id
    if (!lastEntity) {
      return res.status(401).json("No service With this id");
    }
    const serviceFacilityDTO = {
      id,
      transactionId: transactionId || lastEntity.transactionId,
      srvMtServiceId: srvMtServiceId || lastEntity.srvMtServiceId,
      category: category || lastEntity.category,
      facility: facility || lastEntity.facility,
      duration: duration || lastEntity.duration,
      needAssistant: needAssistant || lastEntity.needAssistant,
      status: status || lastEntity.status,
      location: location || lastEntity.location,
      createdBy: createdBy || lastEntity.createdBy,
      image: image || lastEntity.image
    };
    await updateRecordStatus({ id, recordStatus: "LATEST" }, "facilityService", "UPDATED"); // To update latest record status entity
    let response = await addServiceToFacilityApi(serviceFacilityDTO);
    res.status(200).json(response);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteService = async (req, res) => {
  try {
    // this to delete service facility and any thing related to it from
    let id = req.body.id;
    // delete service
    await Promise.all([
      updateRecordStatus({ id, recordStatus: "LATEST" }, "facilityService", "DELETED"),
      // delete tools
      updateRecordStatus({ srvMtFacilityServiceId: id, recordStatus: "LATEST" }, "serviceTools", "DELETED"),
      //delete equipmemts
      updateRecordStatus({ srvMtFacilityServiceId: id, recordStatus: "LATEST" }, "serviceEquipments", "DELETED"),
      //delete rooms
      updateRecordStatus({ srvMtFacilityServiceId: id, recordStatus: "LATEST" }, "serviceRooms", "DELETED"),
      //delete assistance
      updateRecordStatus({ srvMtFacilityServiceId: id, recordStatus: "LATEST" }, "serviceAssistances", "DELETED"),
      //delete provider
      updateRecordStatus({ srvMtFacilityServiceId: id, recordStatus: "LATEST" }, "serviceProviders", "DELETED"),
      //delete followUp
      updateRecordStatus({ srvMtFacilityServiceId: id, recordStatus: "LATEST" }, "followUpServices", "DELETED"),

      //delete services in package
      updateRecordStatus({ [Op.and]: [wherJSONId("service", id), { recordStatus: "LATEST" }] }, "packageServices", "DELETED"),
      //delete diagnosis services
      updateRecordStatus({ srvMtFacilityServiceId: id, recordStatus: "LATEST" }, "serviceDiagnosis", "DELETED"),
      //delete care validation
      updateRecordStatus({ srvMtFacilityServiceId: id, recordStatus: "LATEST" }, "serviceCareValidations", "DELETED"),
    ]);
    res.status(200).json({ message: "service deleted", id });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteProviderAssistantServices = async (req, res) => {
  try {
    // console.log(req);
    const { role, id, category, providerId } = req.body;

    let result = await sequelize.models.facilityCategory.findAll({
      where: {
        id: category,
        recordStatus: "LATEST",
      },
    });
    // console.log(result[0].category.id, "catttt");

    let result2 = await sequelize.models.category.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [wherINJSON("parent_id", "eq", "id", result[0]?.category.id)],
          },
          { id: result[0]?.category.id },
        ],
      },
    });
    let srvIds = result2.filter((ele) => ele.id != result[0]?.category.id);
    let result3;
    let finalArray = [];
    for (let i = 0; i < result2.length; i++) {
      result3 = await sequelize.models.facilityCategory.findAll({
        where: {
          [Op.and]: [category ? wherINJSON("category", "eq", "id", result2[i].id) : "", { recordStatus: "LATEST" }],
        },
      });
      finalArray.push(...result3);
    }
    let newArray = finalArray.map((ele) => ele.id);
    // services ? arrayOfIds("id", servicesIds) : "",
    let result4 = await sequelize.models.facilityService.findAll({
      where: {
        [Op.and]: [id ? arrayOfIds("category", newArray) : "", { recordStatus: "LATEST" }],
      },
    });
    let arrOfServices = result4.map((ele) => ele.id);
    let result5 = await sequelize.models.serviceProviders.findAll({
      where: {
        [Op.and]: [wherJSONId("provider", providerId), id ? arrayOfIds("srvMtFacilityServiceId", arrOfServices) : "", { recordStatus: "LATEST" }],
      },
    });
    let result6 = await sequelize.models.serviceAssistances.findAll({
      where: {
        [Op.and]: [wherJSONId("assistant", providerId), id ? arrayOfIds("srvMtFacilityServiceId", arrOfServices) : "", { recordStatus: "LATEST" }],
      },
    });
    if (role === "1" || role === "2") {
      for (let i = 0; i < result5.length; i++) {
        const data = await dispatcher({
          uri: "/services/providers/deleteProvider",
          body: { providerId, serviceId: result5[i].dataValues.srvMtFacilityServiceId },
        });
      }
    }
    if (role === "3") {
      for (let i = 0; i < result6.length; i++) {
        const data = await dispatcher({
          uri: "/services/assistants/deleteAssistent",
          body: { assistanceId: providerId, serviceId: result6 ? result6[i]?.dataValues?.srvMtFacilityServiceId : "" },
        });
      }
    }
      res.status(200).json({ message: ` Services have been deleted` });

  } catch (error) {
    res.status(400).json(error.message);
  }
};
module.exports = {
  addServiceToFacility,
  getServices,
  getFullViewService,
  updateServiceFacility,
  deleteService,
  deleteProviderAssistantServices,
};

//------------------------------------------------------------------------------------------- support Functiion ---------------------------------------------

// recercive function to find all sub cateqory
const getSubCategories = async (category_id, final_categories_ids, facilities) => {
  let promises = [];
  console.log("facilities =>", facilities);
  let categories_ids = await sequelize.models.facilityCategory.findAll({
    attributes: ["category"],
    where: {
      [Op.and]: [
        wherJSONIdDynamic("category", category_id, "parentId.id"),
        wherINJSON("facility", "in", "id", facilities),
        {recordStatus: "LATEST"}
      ]
    },
    raw: true,
  });

  categories_ids = categories_ids.map((record) => {
    final_categories_ids.push(record.category.id);

    return record.category.id;
  });

  categories_ids.map((category_id) => {
    promises.push(getSubCategories(category_id, final_categories_ids, facilities));
  });
  await Promise.all(promises);
};

const getServiceByCategory = async (categoryIdS, name, status, language, providers) => {
  try {
    let arr = [];
    let allServices = await sequelize.models.facilityService.findAll({
      where: {
        [Op.and]: [
          {
            category: {
              [Op.in]: categoryIdS,
            },
          },

          name
            ? {
                [Op.or]: [wherJSONLike("srv_mt_service_id", `name.ar`, name), wherJSONLike("srv_mt_service_id", `name.en`, name)],
              }
            : "",
          status ? { status: status } : "",
          providers
            ? {
                id: {
                  [Op.in]: providers,
                },
              }
            : "",
          // providers  ? wherJSONIdDynamic("srv_mt_service_id", providers, "id") : "",
          { recordStatus: "LATEST" },
        ],
      },
    });

    for (let i = 0; i < allServices.length; i++) {
      const element = allServices[i];
      const serviceInfo = await sequelize.models.service.findOne({
        where: {
          id: element.srvMtServiceId.id,
          recordStatus: "LATEST",
        },
      });
      const providers = await sequelize.models.serviceProviders.findAll({
        where: {
          srvMtFacilityServiceId: element.id,
          recordStatus: "LATEST",
        },
      });
      arr.push({ ...element.dataValues, serviceInfo, providers });
    }
    return arr;
  } catch (error) {
    throw error;
  }
};

const findIds = async (array, facilities) => {
  try {
    let arrayOfIds = [];
    for (let j = 0; j < array.length; j++) {
      const element = array[j];
      const response = await sequelize.models.facilityCategory.findOne({
        where: {
          category: wherJSONIdDynamic("category", element, "id"),
          recordStatus: "LATEST",
          facility: wherINJSON("facility", "in", "id", facilities)
        },
      });
      arrayOfIds.push(response.id);
    }
    return arrayOfIds;
  } catch (error) {
    throw error;
  }
};

//======================================================================================Support Function to get Full view Of Service ==================================================================
const getService = async (id) => {
  try {
    // this will take id of service facility from body and returen the info of this service in the facility
    return await sequelize.models.facilityService.findOne({
      where: {
        id: id,
        recordStatus: "LATEST",
      },
    });
  } catch (error) {
    throw error;
  }
};

const getServiceInfo = async (id) => {
  try {
    return await sequelize.models.service.findOne({
      where: {
        id,
        recordStatus: "LATEST",
      },
    });
  } catch (error) {
    throw error;
  }
};

const getServiceTools = async (srvMtFacilityServiceId) => {
  try {
    return await sequelize.models.serviceTools.findAll({
      where: {
        srvMtFacilityServiceId,
        recordStatus: "LATEST",
      },
    });
  } catch (error) {
    throw error;
  }
};

const getServiceProviders = async (srvMtFacilityServiceId) => {
  try {
    return await sequelize.models.serviceProviders.findAll({
      where: {
        srvMtFacilityServiceId,
        recordStatus: "LATEST",
      },
    });
  } catch (error) {
    throw error;
  }
};

const getAssistents = async (srvMtFacilityServiceId) => {
  try {
    return await sequelize.models.serviceAssistances.findAll({
      where: {
        srvMtFacilityServiceId,
        recordStatus: "LATEST",
      },
    });
  } catch (error) {
    throw error;
  }
};

const getEquipmemts = async (srvMtFacilityServiceId) => {
  try {
    return await sequelize.models.serviceEquipments.findAll({
      where: {
        srvMtFacilityServiceId,
        recordStatus: "LATEST",
      },
    });
  } catch (error) {
    throw error;
  }
};

const getRooms = async (srvMtFacilityServiceId) => {
  try {
    return await sequelize.models.serviceRooms.findAll({
      where: {
        srvMtFacilityServiceId,
        recordStatus: "LATEST",
      },
    });
  } catch (error) {
    throw error;
  }
};

const getFollowUp = async (srvMtFacilityServiceId) => {
  try {
    return await sequelize.models.followUpServices.findAll({
      where: {
        srvMtFacilityServiceId,
        recordStatus: "LATEST",
      },
    });
  } catch (error) {
    throw error;
  }
};

const getPackages = async (srvMtFacilityServiceId) => {
  try {
    let packages = await sequelize.models.packageServices.findAll({
      where: {
        service: wherJSONId("service", srvMtFacilityServiceId),
        recordStatus: "LATEST",
      },
      group: ["srvMtPackageId"],
      attributes: ["srvMtPackageId"],
    });
    packages = packages.map((record) => record.srvMtPackageId);
    // now i will found the package details based on id
    let arraysOfPackages = await Promise.all(
      packages.map((packageId) =>
        sequelize.models.packages.findOne({
          where: { id: packageId, recordStatus: "latest" },
        })
      )
    );
    return arraysOfPackages;
  } catch (error) {
    throw error;
  }
};

const getDiagnosis = async (srvMtFacilityServiceId) => {
  try {
    // fierst i will search in service_diagnosis table
    let diagnosesDetails = [];

    let diagnosis = await sequelize.models.serviceDiagnosis.findAll({
      where: {
        recordStatus: "LATEST",
        srvMtFacilityServiceId,
      },
    });
    // now i want to access in package diagnoses discription from diagnosis table

    for (let i = 0; i < diagnosis.length; i++) {
      let discription = await sequelize.models.diagnosis.findOne({
        where: {
          recordStatus: "LATEST",
          id: diagnosis[i].diagnosis.id,
        },
        attributes: ["description"],
      });
      diagnosesDetails.push({ ...diagnosis[i].dataValues, discription });
    }
    return diagnosesDetails;
  } catch (error) {
    throw error;
  }
};

const getCareValidation = async (srvMtFacilityServiceId) => {
  // now i want to get all care Validation for service
  let preCare = [];
  let postCare = [];
  let preValidation = [];
  let postValidation = [];
  try {
    let vareValidation = await sequelize.models.serviceCareValidations.findAll({
      where: {
        recordStatus: "LATEST",
        srvMtFacilityServiceId,
      },
      attributes: ["srvMtCareValidationId"],
    });
    vareValidation = vareValidation.map((careVal) => careVal.srvMtCareValidationId);

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
    return { preCare, postCare, preValidation, postValidation };
  } catch (error) {
    throw error;
  }
};

// ================================================================================ End full View Of Service =============================================================================================

// ===================================================== services based on providers ============

const getServiceByProviders = async (providers) => {
  try {
    let allProviders = await sequelize.models.serviceProviders.findAll({
      where: {
        [Op.and]: [wherINJSON("provider", "in", "id", providers), { recordStatus: "LATEST" }],
      },
    });
    return allProviders.map((provider) => provider.srvMtFacilityServiceId);
  } catch (error) {
    throw error;
  }
};
