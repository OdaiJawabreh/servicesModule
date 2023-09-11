"use strict";

// const saveDocument = async (data, options) => {
//   await es.insertOrUpdate("consumers", [data]);
// };
// const updateDocument = async (data, options) => {
//   await es.insertOrUpdate("consumers", [data]);
// };
const { Model, DATE } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class serviceProviders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(serviceProviders) {
      // define association here
    }
  }
  serviceProviders.init(
    {
      seq: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      id: { type: DataTypes.STRING, allowNull: false },
    
      srvMtFacilityServiceId:{type: DataTypes.STRING, allowNull: false },
      provider: {type: DataTypes.JSON, allowNull: false}, 
      price: DataTypes.JSON,

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
      modelName: "serviceProviders",
      tableName: "SRV_RT_Service_Providers",
      underscored: true,
      freezeTableName: true,
    }
  );
  return serviceProviders;
};
