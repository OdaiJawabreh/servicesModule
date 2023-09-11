const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { CategoryToFacility, updateRecordStatus } = require("../services/API'S");
const { createTransactionIdOrId, wherJSONIdDynamic, wherJSONId } = require("../sharedFunctions/index");
const { addAllCategory, addChildCategory } = require("../services/addCategoriesToFacility");

const addCategoryToFacility = async (req, res) => {
  try {
    /* this API to add general Category you can add main category(Parent id = null ) or you can add sub category(parent id not null) */
    const { category, facility, status, transactionId, createdBy } = req.body;
    const categoryFacilityDTO = {
      id: createTransactionIdOrId("SRV-SFC-JOR-"),
      transactionId: !transactionId ? createTransactionIdOrId("TRN-SRV-SFC-JOR-") : transactionId,
      category,
      facility,
      status,
      createdBy,
    };
    let categoryFacility = await CategoryToFacility(categoryFacilityDTO);
    res.status(200).json(categoryFacility);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const getCategoriesByFacility = async (req, res) => {
  try {
    /*
    1. take facilityid and categoryid will return all sub category for this category in this the spacific facility
    2. take facilityid withot categoryId return akk categories in this facility
    3. take facilityid with categoryid "null" will return all parent Categries in this service
    */
    const { facilityId, parentId, category } = req.body;

    let result = await sequelize.models.facilityCategory.findAll({
      where: {
        [Op.and]: [
          parentId !== undefined ? wherJSONIdDynamic("category", parentId, "parentId.id") : "",
          facilityId ? wherJSONIdDynamic("facility", facilityId, "id") : "",
          category ? wherJSONIdDynamic("category", category, "id") : "",
          { recordStatus: "LATEST" },
        ],
      },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const getParentsCategoryForSpacificCategory = async (req, res) => {
  try {
    /* i need this Api when i want to update facility service 
    i will show the selected category as bridcrum dee>swsw>ceee so i 
    need to know what is the parents while i find parentid = "null" */
    let id = req.body.id;
    let finalCategories = [];
    let toggle = false;
    let currentCategory = await sequelize.models.facilityCategory.findOne({
      attributes: ["category"],
      where: {
        recordStatus: "LATEST",
        id,
      },
    });
    if (!currentCategory) {
      return res.status(401).json({
        success: false,
        message: `plese select correct cateqory`,
      });
    }
    finalCategories.unshift(currentCategory);
    let idForParentCategory = currentCategory.category.parentId.id;
    if (idForParentCategory == "null") return res.status(200).json(finalCategories); // this if the category is main category so no nedd to find the parent for it
    while (!toggle) {
      let response = await sequelize.models.facilityCategory.findOne({
        where: {
          recordStatus: "LATEST",
          category: wherJSONId("category", idForParentCategory),
        },
        attributes: ["category"],
      });
      if (response) {
        idForParentCategory = response.category.parentId.id;
        finalCategories.unshift(response);
      } else {
        toggle = true;
      }
    }
    res.status(200).json(finalCategories);
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const deleteCatgoryFromFacility = async (req, res) => {
  try {
    // this to delete the category from spacific facility
    const id = req.body.id;
    let result = await updateRecordStatus({ id, recordStatus: "LATEST" }, "facilityCategory", "DELETED");
    if (result[0] == "0") {
      return res.status(401).json("There is no attachmrnt with this id ");
    }
    res.json({ id, message: "Category Deleted Deleted" });
  } catch (error) {
    res.status(402).json(error.message);
  }
};

const addFacilityCategories = async (req, res) => {
  try {
    const { categories, facility, createdBy, transactionId } = req.body;
    // to add more than category to specific facility
    let response = [];
    if (!categories[0].parent.id) {
      addAllCategory(categories[0], { id: facility.id, name: facility.name }, createdBy, transactionId, response);
      return res.status(200).json({ message: "This categories are Added Successfully", response });
    } else {
      await addChildCategory(categories[0], { id: facility.id, name: facility.name }, createdBy, transactionId, response);
      return res.status(200).json({ message: "This categories are Added Successfully", response });
    }
  } catch (error) {
    console.log({ message: "error in addFacilityCategories ", error: error.message });
    res.status(402).json(error.message);
  }
};
module.exports = {
  addCategoryToFacility,
  getCategoriesByFacility,
  deleteCatgoryFromFacility,
  getParentsCategoryForSpacificCategory,
  addFacilityCategories,
};
