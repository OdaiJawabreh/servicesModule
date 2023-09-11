"use strict";

// const saveDocument = async (data, options) => {
//   await es.insertOrUpdate("consumers", [data]);
// };
// const updateDocument = async (data, options) => {
//   await es.insertOrUpdate("consumers", [data]);
// };
const { Model, DATE } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class serviceTools extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(serviceTools) {
      // define association here
    }
  }
  serviceTools.init(
    {
      seq: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id: { type: DataTypes.STRING, allowNull: false },
    
      srvMtFacilityServiceId:{type: DataTypes.STRING, allowNull: false },
      category:DataTypes.JSON,
      tool:{type: DataTypes.JSON, allowNull: false},


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
      modelName: "serviceTools",
      tableName: "SRV_RT_Service_Tools",
      underscored: true,
      freezeTableName: true,
    }
  );
  return serviceTools;
};
