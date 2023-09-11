const { sequelize } = require("../../models/index");
const { Op, where, DATE } = require("sequelize");
const res = require("express/lib/response");
// sequelize.sync();
const { createMedicineAPI, updateRecordStatus } = require("../services/API'S");
const { createTransactionIdOrId, wherJSONId } = require("../sharedFunctions/index");

const createMedicine = async (req, res) => {
  try {
    /* this to create general medicine */
    const { name, description, manufacture,transactionId, createdBy } = req.body;
    const medicineDTO = {
      id: createTransactionIdOrId("SRV-SMD-JOR-"),
      transactionId: !transactionId
        ? createTransactionIdOrId("SRV-SMD-JOR-")
        : transactionId,
      createdBy,
      name,
      description,
      manufacture
    };
    let result = await createMedicineAPI(medicineDTO);
    res.status(200).json(result);
  } catch (error) {
    res.status(402).json(error.message);
  }
};
const deleteMidicine = async (req, res) => {
  try {
    /* this to delete main Midicine and keep in mind that if you are delete Midicine you should delete any prescription cinnected with this Midicine  */
    let id = req.body.id;

    let result = await updateRecordStatus(
      { id, recordStatus: "LATEST" },
      "medicine",
      "DELETED"
    );
    if (result[0] == "0") {
      return res.status(401).json("There is no Midicine with this id ");
    }
    // now im going to delete every prescription_Midicine with this Midicine
    await updateRecordStatus(
      { [Op.and]: [wherJSONId("medicine", id), { recordStatus: "LATEST" }] },
      "diagnosisPrescriptions",
      "DELETED"
    );
    res
      .status(200)
      .json({
        id,
        message: "Midicine deleted and deleted from any prescription used it",
      });
  } catch (error) {
    res.status(402).json(error.message);
  }
};
module.exports = { createMedicine, deleteMidicine };
