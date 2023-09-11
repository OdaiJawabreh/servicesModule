const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const {
  createPackageAPI,
  findEntity,
  updateRecordStatus,
  addServiceToPackageAPI
} = require("../services/API'S");
const {
  createTransactionIdOrId,
  wherJSONLike,
  wherINJSON,
  arrayOfIds,
  wherJSONId,
} = require("../sharedFunctions/index");

const createPackage = async (req, res) => {
  try {
    // to add assistance to spacific Service
    const {
      transactionId,
      createdBy,
      name,
      description,
      dateFrom,
      dateTo,
      price,
      status,
      facility,
      type,
      packageServicePricing, // this to work event in billibg
    } = req.body;
    const packageDTO = {
      id: createTransactionIdOrId("SRV-SPK-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SPK-JOR-")
        : transactionId,
      createdBy,
      name,
      description,
      dateFrom,
      dateTo,
      price,
      status,
      facility,
      type,
    };
    let result = await createPackageAPI(packageDTO);
    for (let i = 0; i < packageServicePricing.length; i++) {
      let element = packageServicePricing[i];
      let serviceDTO = {
        id: createTransactionIdOrId("SRV-SPS-JOR-"),
        srvMtPackageId: result.dataValues.id,
        service: element.service,
        provider: element.provider,
        quantity: element.quantity,
        createdBy,
        transactionId: result.dataValues.transactionId,
      };
      await addServiceToPackageAPI(serviceDTO);
    }
    res.status(200).json({
      id: result.id,
      package: {id: result.id, name},
      facility,
      transactionId: result.transactionId,
      packageServicePricing,
    });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const getPackagesByFacility = async (req, res) => {
  try {
    /* this Api To get packages by facilities or search on package name or you can select 
    spacidic service and return all packages with all details belongs to the service*/
    let { facilities, services, packageName, type } = req.body;
    let servicesIds = []; // i decleared this to push all consumer with one establishment
    services ? (servicesIds = await getPackagesByServices(services)) : "";

    let allPackages = await sequelize.models.packages.findAll({
      where: {
        [Op.and]: [
          { recordStatus: "LATEST" },
          packageName
            ? {
                [Op.or]: [
                  packageName ? wherJSONLike("name", "en", packageName) : "",
                  packageName ? wherJSONLike("name", "ar", packageName) : "",
                ],
              }
            : "",
          services ? arrayOfIds("id", servicesIds) : "",
          facilities ? wherINJSON("facility", "in", "id", facilities) : "",
          type ? wherINJSON("type", "eq", "id", type) : "",
        ],
      },
    });
    if (!allPackages.length)
      return res
        .status(200)
        .send([{ Active: [] }, { Upcoming: [] }, { Expired: [] }]); // if thers no Package with conditions
    let result = await reArrangePackages(allPackages);
    res
      .status(200)
      .send([
        { Active: [...result.Active] },
        { Upcoming: [...result.Upcoming] },
        { Expired: [...result.Expired] },
      ]);

    // // this will take facility id from body and will return all packages belong to this faciliry and catogrixe (active.comingSoon,expired)
    // let facilityId = req.body.facilityId;
    // // to check if req contine facilityId
    // if (!facilityId) return res.status(401).json("send Correct facilityId");
    // let allPackages = await sequelize.models.packages.findAll({
    //   where: {
    //     recordStatus: "LATEST",
    //     facility: wherJSONId("facility", facilityId),
    //   },
    // });
    // if (!allPackages.length) return res.status(200).send(allPackages); // if thers no Package in this facility
    // let result = await reArrangePackages(allPackages);
    // res.send(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const updatePackage = async (req, res) => {
  try {
    // this to update general info about Package name dates dics etc...
    const {
      id,
      name,
      description,
      dateFrom,
      dateTo,
      price,
      status,
      transactionId,
      createdBy,
      package,
      type
    } = req.body;
    // this to current entity based on id
    let lastEntity = await findEntity(
      { id: package? package.id : id , recordStatus: "LATEST" },
      "packages"
    );
    // to check there is package with this id
    if (!lastEntity) return res.status(401).json("No address With this id");

    const packageDTO = {
      id: lastEntity.id,
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-CON-CNP-JOR-")
        : transactionId,
      name: name || lastEntity.name,
      description: description || lastEntity.description,
      dateFrom: dateFrom || lastEntity.dateFrom,
      dateTo: dateTo === null || dateTo  ? dateTo  :  lastEntity.dateTo,
      price: price != undefined ? price : lastEntity.price,
      status:  lastEntity.status,
      createdBy: createdBy || lastEntity.createdBy,
      facility: lastEntity.facility,
      type: type || lastEntity.type
    };

    await updateRecordStatus(
      { id: package? package.id : id, recordStatus: "LATEST" },
      "packages",
      "UPDATED"
    ); // update Record Status

    let result = await createPackageAPI(packageDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const getPackageById = async (req, res) => {
  try {
    // thid if i need spacific package what contine service and package details
    let id = req.body.id;
    let package = await sequelize.models.packages.findOne({
      where: {
        recordStatus: "LATEST",
        id,
      },
    });
    // console.log(package.id);
    // to get all of service belong to this package
    let services = await sequelize.models.packageServices.findAll({
      where: {
        recordStatus: "LATEST",
        srvMtPackageId: package.id,
      },
    });
    res.send({ ...package.dataValues, services });
  } catch (error) {
    res.status(400).json(error);
  }
};
const deletePackage = async (req, res) => {
  try {
    // to delete package and if you daelete package will delete any service_package belong to it
    let id = req.body.id;
    await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "packages",
      "DELETED"
    );
    await updateRecordStatus(
      { srvMtPackageId: id, recordStatus: "LATEST" },
      "packageServices",
      "DELETED"
    );
    res.status(200).json({
      id,
      message: "package Deleted With all details",
    });
  } catch (error) {
    res.status(402).json(error.message);
  }
};
module.exports = {
  createPackage,
  getPackagesByFacility,
  updatePackage,
  getPackageById,
  deletePackage,
};

//========================================================================================      Support Functions //========================================================================================

async function reArrangePackages(allPackages) {
  // this to rearrange the package under three category (expired,active,comingsoon)
  let dateNow = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .substr(0, 10); // this will give current date as string with this format 2022-01-01
  let Active = [];
  let Upcoming = [];
  let Expired = [];
  allPackages.forEach((onePackage) => {
    if(onePackage.dateTo) {
      if (onePackage.dateTo >= dateNow && onePackage.dateFrom <= dateNow) {
        Active.push(onePackage);
      } else if (onePackage.dateTo > dateNow && onePackage.dateFrom > dateNow) {
        Upcoming.push(onePackage);
      } else if (onePackage.dateTo < dateNow && onePackage.dateFrom < dateNow) {
        Expired.push(onePackage);
      }
    } else {
      if(onePackage.dateFrom <= dateNow){
        Active.push(onePackage)
      }else {
        Upcoming.push(onePackage);
      }
    }

  });
  Active.length ? (Active = await getpackageServices(Active)) : "";
  Upcoming.length ? (Upcoming = await getpackageServices(Upcoming)) : "";
  Expired.length ? (Expired = await getpackageServices(Expired)) : "";
  return { Active, Upcoming, Expired };
}

async function getpackageServices(packages) {
  // this will give me access at every single package what is the services belong to this package
  let array = [];
  for (let i = 0; i < packages.length; i++) {
    let result = await sequelize.models.packageServices.findAll({
      where: {
        recordStatus: "LATEST",
        srvMtPackageId: packages[i].id,
      },
    });
    let response = await getPricing(result);
    array.push({ ...packages[i].dataValues, services: response });
  }
  return array;
}

async function getPackagesByServices(services) {
  try {
    // TO GET PACKAGES BELONGS TO Spacific services
    let result = await sequelize.models.packageServices.findAll({
      where: {
        [Op.and]: [
          { recordStatus: "LATEST" },
          wherINJSON("service", "in", "id", services),
        ],
      },
    });
    return result.map((package) => package.srvMtPackageId);
  } catch (error) {
    throw error;
  }
}

async function getPricing(array) {
  try {
    let arr = [];
    for (let i = 0; i < array.length; i++) {
      let price = await sequelize.models.serviceProviders.findOne({
        where: {
          [Op.and]: [
            { recordStatus: "LATEST" },
            wherJSONId("provider", array[i].provider.id),
            { srvMtFacilityServiceId: array[i].service.id },
          ],
        },
      });
      arr.push({ ...array[i].dataValues, price: price });
    }
    return arr;
  } catch (error) {
    throw error;
  }
}
