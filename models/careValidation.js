"use strict";

// const saveDocument = async (data, options) => {
//   await es.insertOrUpdate("consumers", [data]);
// };
// const updateDocument = async (data, options) => {
//   await es.insertOrUpdate("consumers", [data]);
// };
const { Model, DATE } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class careValidation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(careValidation) {
      // define association here
    }
  }
  careValidation.init(
    {
      seq: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id: { type: DataTypes.STRING, allowNull: false },
      subject:{type: DataTypes.JSON, allowNull: false},
      description: { type: DataTypes.JSON },
      type: DataTypes.JSON, // care or validation
      time: DataTypes.JSON, // pre or post
      ageFrom: DataTypes.INTEGER,
      ageTo: DataTypes.INTEGER,
      gender: DataTypes.JSON,
      maritalStatus: DataTypes.JSON,
      pregnant: DataTypes.JSON,
      goal: DataTypes.JSON,
      // THIS INFORMATION TO HEADER
      transactionId: { type: DataTypes.STRING, allowNull: false },
      recordStatus: {
        type: DataTypes.ENUM,
        values: ["LATEST", "UPDATED", "DELETED"],
        defaultValue: "LATEST",
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
      },
       createdBy: {
        type: DataTypes.JSON,
      },
    },

    {
      initialAutoIncrement: 1000000,
      // hooks: {
      //   afterCreate: saveDocument,
      //   afterUpdate: updateDocument,
      // },
      sequelize,
      modelName: "careValidation",
      tableName: "SRV_MT_Care_Validation",
      underscored: true,
      freezeTableName: true,
    }
  );
  return careValidation;
};
