//CON-CNP-JOR-XXX-XXX-XXX
//TRN-CON-CNP-JOR-XXX-XXX-XXX
const { v4: uuidv4 } = require("uuid");
const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");

const createTransactionIdOrId = (tableName) => {
  // this function to return id and transaction id
  return tableName + uuidv4();
};

const wherJSONId = (key, value) => {
  // this function to return where condition if i do search based in id (lockup) in Json format
  return sequelize.where(
    sequelize.fn("JSON_VALUE", sequelize.col(key), sequelize.literal(`"$.id"`)),
    Op.eq,
    `${value}`
  );
};

const wherJSONIdDynamic = (key, value, nested) => {
  // this function to return where condition if i do search based in id (lockup) in Json format
  return sequelize.where(
    sequelize.fn("JSON_VALUE", sequelize.col(key), sequelize.literal(`"$.${nested}"`)),
    Op.eq,
    `${value}`
  );
};

const wherJSONLike = (key, language, name) => {
  // this function to return where condition if i do search based on sny thing (LIKE) in jsin fomat
  return sequelize.where(
    sequelize.fn(
      "JSON_VALUE",
      sequelize.col(key),
      sequelize.literal(`"$.${language}"`) //'"$.value"'
    ),
    Op.like,
    `%${name}%`
  );
};

const arrayOfIds = (key, array) => {
  // this function to return where condition when i need it includes value in array
  return {
    [key]: {
      [Op.in]: array,
    },
  };
};

const whereBetween = (key, value) => {
  // this function to return where condition between to values
  return {
    [key]: {
      [Op.between]: [value.ageTo, value.ageFrom],
    },
  };
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
const wherINJSON = (key, operationName, path, value) => {
  // this function to return where condition if i do search based in any key and any path in Json format
  if (operationName === "like") value = `%${value}%`;
  return sequelize.where(
    sequelize.fn(
      "JSON_VALUE",
      sequelize.col(key),
      sequelize.literal(`"$.${path}"`)
    ),
    {
      [Op[operationName]]: value,
    }
  );
};

module.exports = {
  createTransactionIdOrId,
  wherJSONLike,
  wherJSONId,
  arrayOfIds,
  whereBetween,
  wherJSONIdDynamic,
  findEntity,
  updateRecordStatus,
  wherINJSON
};


