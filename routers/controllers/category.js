const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { createCategoryApi } = require("../services/API'S");
const {
  createTransactionIdOrId,
  wherJSONIdDynamic,
} = require("../sharedFunctions/index");

const createCategory = async (req, res) => {
  try {
    /* this API to add general Category you can add main category(Parent id = "null" ) or you can add sub category(parent id not "null") */
    const { name,image, description, parentId, transactionId, createdBy, fieldType } =
      req.body;
    const categoryDTO = {
      id: createTransactionIdOrId("SRV-SRC-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("TRN-SRV-SRC-JOR-")
        : transactionId,
      name,
      image,
      description,
      parentId,
      createdBy,
      fieldType,
    };
    let category = await createCategoryApi(categoryDTO);
    res.status(200).json(category);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const getSubCategoryForCategory = async (req, res) => {
  try {
    /*
    1. take  categoryid will return all sub category for this category 
    2. take categoryid = null  return all sub category
    */
    const { categoryId } = req.body;
    let result = await sequelize.models.category.findAll({
      where: {
        [Op.and]: [
          categoryId !== undefined
            ? wherJSONIdDynamic("parent_id", categoryId, "id")
            : "",
          { recordStatus: "LATEST" },
        ],
      },
    });
    // console.log(typeof(result[0].category.parentId.id))
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const getAllCategory = async (req, res) => {
  try {
    // this to get all category we have it as a tree
    let array = [];
    // const {workspace-field} =
    const key = req.headers["workspace-field"];
    // console.log("====================================");
    // console.log("key from headers => ", key);
    // console.log("====================================");
    // const {key} = req.body; // for test lacally
    let language = req.body.language;
    let result = await sequelize.models.category.findAll({
      where: {
        [Op.and]: [
          wherJSONIdDynamic("parent_id", "null", "id"),
          {[Op.or]:[
            wherJSONIdDynamic("field_type", key, "key"),
            wherJSONIdDynamic("field_type", key, "field")
          ]},
          { recordStatus: "LATEST" },
        ],
      },
    });
    if (!result.length) {
      return res.status(200).json({
        array,
        key,
      });
    }
    result = result.map((category) => {
      return {
        id: category.id,
        name: category.name[language],
        fullName: category.name,
        parent: {
          id: category.parentId.id,
          name: category.parentId.name
        },
      };
    });
    for (let i = 0; i < result.length; i++) {
      let children = [...(await getChildernForCategory(result[i], language))];
      array.push({
        ...result[i],
        children,
      });
    }
    res.status(200).send({
      array,
      key: key,
    });
  } catch (error) {
    res.send(error);
  }
};
module.exports = { createCategory, getSubCategoryForCategory, getAllCategory };

const getChildernForCategory = async (category, language) => {
  try {
    let array = [];
    let result = await sequelize.models.category.findAll({
      where: {
        [Op.and]: [
          wherJSONIdDynamic("parent_id", category.id, "id"),
          { recordStatus: "LATEST" },
        ],
      },
    });
    result = result.map((category) => {
      return {
        id: category.dataValues.id,
        name: category.dataValues.name[language],
        fullName: category.dataValues.name,
        children: [],
        parent: {
          id: category.dataValues.parentId.id,
          name: category.dataValues.parentId.name
        },
      };
    });
    for (let i = 0; i < result.length; i++) {
      let children = [...(await getChildernForCategory(result[i], language))];
      array.push({
        ...result[i],
        children,
      });
    }

    return array;
  } catch (error) {
    throw error;
  }
};
