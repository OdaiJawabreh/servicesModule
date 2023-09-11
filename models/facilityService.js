"use strict";

// const saveDocument = async (data, options) => {
//   await es.insertOrUpdate("consumers", [data]);
// };
// const updateDocument = async (data, options) => {
//   await es.insertOrUpdate("consumers", [data]);
// };
const { Model, DATE } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class facilityService extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  facilityService.init(
    {
      seq: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id: { type: DataTypes.STRING, allowNull: false },
    
      srvMtServiceId:{type: DataTypes.JSON, allowNull: false},
      category:{type: DataTypes.STRING , allowNull: false}, 
      facility:DataTypes.JSON,
      duration:DataTypes.STRING,
      image:DataTypes.STRING,
      needAssistant: {type: DataTypes.BOOLEAN,  defaultValue: false},
      image: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM,
        values: ["AVAILABLE", "UNAVAILABLE"],
        defaultValue: "AVAILABLE",
      },
      location: DataTypes.JSON,
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
      modelName: "facilityService",
      tableName: "SRV_MT_Facility_Service",
      underscored: true,
      freezeTableName: true,
    }
  );
  return facilityService;
};
