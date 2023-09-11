// this page to define all Apis in feature
const { sequelize } = require("../../models/index");
const { wherJSONIdDynamic } = require("../sharedFunctions/index");
const { Op, where, DATE } = require("sequelize");

const createCategoryApi = async (categoryDTO) => {
  try {
    return await sequelize.models.category.create(categoryDTO);
  } catch (error) {
    throw error;
  }
};

const CategoryToFacility = async (categoryFacilityDTO) => {
  try {
    return await sequelize.models.facilityCategory.create(categoryFacilityDTO);
  } catch (error) {
    throw error;
  }
};

const createServiceApi = async (serviceDTO) => {
  try {
    return await sequelize.models.service.create(serviceDTO);
  } catch (error) {
    throw error;
  }
};

const addServiceToFacilityApi = async (serviceFacilityDTO) => {
  try {
    return await sequelize.models.facilityService.create(serviceFacilityDTO);
  } catch (error) {
    throw error;
  }
};

const addtoolsToServiceAPI = async (serviceToolsDTO) => {
  try {
    return await sequelize.models.serviceTools.create(serviceToolsDTO);
  } catch (error) {
    throw error;
  }
};

const addEquipmentsToServiceAPI = async (equibmentServiceDTO) => {
  try {
    return await sequelize.models.serviceEquipments.create(equibmentServiceDTO);
  } catch (error) {
    throw error;
  }
};

const addAssistentToServiceAPI = async (serviceAssistantsDTO) => {
  try {
    return await sequelize.models.serviceAssistances.create(serviceAssistantsDTO);
  } catch (error) {
    throw error;
  }
};

const addProviderToServiceAPI = async (serviceProviderDTO) => {
  try {
    return await sequelize.models.serviceProviders.create(serviceProviderDTO);
  } catch (error) {
    throw error;
  }
};

const addFollowUpServiceAPI = async (followUpServiceDTO) => {
  try {
    return await sequelize.models.followUpServices.create(followUpServiceDTO);
  } catch (error) {
    throw error;
  }
};
const createPackageAPI = async (packageDTO) => {
  try {
    return await sequelize.models.packages.create(packageDTO);
  } catch (error) {
    throw error;
  }
};

const addServiceToPackageAPI = async (packageServiceDTO) => {
  try {
    return await sequelize.models.packageServices.create(packageServiceDTO);
  } catch (error) {
    throw error;
  }
};

const createDiagnosisApi = async (diagnosisDTO) => {
  try {
    return await sequelize.models.diagnosis.create(diagnosisDTO);
  } catch (error) {
    throw error;
  }
};

const createMedicineAPI = async (medicineDTO) => {
  try {
    return await sequelize.models.medicine.create(medicineDTO);
  } catch (error) {
    throw error;
  }
};

const addDiagnosisToServiceAPI = async (diagnosisServiceDTO) => {
  try {
    return await sequelize.models.serviceDiagnosis.create(diagnosisServiceDTO);
  } catch (error) {
    throw error;
  }
};

const addPrescriptionsToDiagnosisAPI = async (addPrescriptionsDTO) => {
  try {
    return await sequelize.models.diagnosisPrescriptions.create(addPrescriptionsDTO);
  } catch (error) {
    throw error;
  }
};

const createCareValidationApi = async (careValidationDTO) => {
  try {
    return await sequelize.models.careValidation.create(careValidationDTO);
  } catch (error) {
    throw error;
  }
};

const addCareValidationToServiceAPI = async (serviceCareValidationDTO) => {
  try {
    return await sequelize.models.serviceCareValidations.create(serviceCareValidationDTO);
  } catch (error) {
    throw error;
  }
};

const createSettingsAPI = async (settingsDTO) => {
  try {
    return await sequelize.models.settings.create(settingsDTO);
  } catch (error) {
    throw error;
  }
};
const findEntity = async (condition, modelName) => {
  try {
    // this function will update RecordStatus from latest to updated in all models ander any condition
    let response = await sequelize.models[modelName].findOne({
      where: condition,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

const updateRecordStatus = async (condition, modelName, action) => {
  try {
    // this function will update RecordStatus from latest to updated in all models ander any condition
    let response = await sequelize.models[modelName].update(
      { recordStatus: action },
      {
        where: condition,
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};
const addRoomToServiceAPI = async (roomServiceDTO) => {
  try {
    return await sequelize.models.serviceRooms.create(roomServiceDTO);
  } catch (error) {
    throw error;
  }
};

const checkCategory = async (id) => {
  try {
    let response =  await sequelize.models.facilityCategory.findOne({
      where: {
        [Op.and]: [{ recordStatus: "LATEST" }, wherJSONIdDynamic("category", id, "id")],
      },
    });
    return response ? true : false;
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createCategoryApi,
  CategoryToFacility,
  createServiceApi,
  addServiceToFacilityApi,
  addtoolsToServiceAPI,
  addEquipmentsToServiceAPI,
  addAssistentToServiceAPI,
  addProviderToServiceAPI,
  addFollowUpServiceAPI,
  createPackageAPI,
  addServiceToPackageAPI,
  createDiagnosisApi,
  createMedicineAPI,
  addDiagnosisToServiceAPI,
  addPrescriptionsToDiagnosisAPI,
  createCareValidationApi,
  addCareValidationToServiceAPI,
  createSettingsAPI,
  findEntity,
  updateRecordStatus,
  addRoomToServiceAPI,
  checkCategory,
};
