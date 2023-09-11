const { Op } = require("sequelize");
const { checkCategory, CategoryToFacility } = require("./API'S");
const { createTransactionIdOrId } = require("../sharedFunctions/index");
const { sequelize } = require("../../models");

const addAllCategory = async (category, facility, createdBy, transactionId, response) => {
  try {
    // check if the main Category is exist or not
    let check = await checkCategory(category.id);
    if (!check) {
      const categoryFacilityDTO = {
        id: createTransactionIdOrId("SRV-SFC-JOR-"),
        transactionId: !transactionId ? createTransactionIdOrId("TRN-SRV-SFC-JOR-") : transactionId,
        category: {
          id: category.id,
          name: category.fullName,
          parentId: category.parent,
        },
        facility,
        createdBy,
      };
      let result = await CategoryToFacility(categoryFacilityDTO);
      response.push(result);
    }
    for (let index = 0; index < category.children.length; index++) {
      const element = category.children[index];
      await addAllCategory(element, facility, createdBy, transactionId, response);
    }
  } catch (error) {
    throw error;
  }
};

const addChildCategory = async (category, facility, createdBy, transactionId, response) => {
  try {
    // check if this Category exist or nor  is exist or not
    let check = await checkCategory(category.id);
    if (check) return response;
    const categoryFacilityDTO = {
      id: createTransactionIdOrId("SRV-SFC-JOR-"),
      transactionId: !transactionId ? createTransactionIdOrId("TRN-SRV-SFC-JOR-") : transactionId,
      category: {
        id: category.id,
        name: category.fullName,
        parentId: category.parent,
      },
      facility,
      createdBy,
    };
    let result = await CategoryToFacility(categoryFacilityDTO);
    response.push(result);

    let x = await sequelize.models.category.findOne({
      where: {
        recordStatus: "LATEST",
        id: category.parent.id,
      },
    });
    await addChildCategory(
      {
        id: x.id,
        fullName: x.name,
        parent: x.parentId,
      },
      facility,
      createdBy,
      transactionId,
      response
    );
  } catch (error) {
    throw error;
  }
};

module.exports = { addAllCategory, addChildCategory };
