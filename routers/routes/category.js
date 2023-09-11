const express = require("express");
const {  createCategory , getSubCategoryForCategory, getAllCategory} = require("../controllers/category");
const categoty = express.Router();

categoty.post("/createCategory", createCategory);
categoty.post("/getSubCategoryForCategory", getSubCategoryForCategory);
categoty.post("/getAllCategory", getAllCategory);

module.exports = categoty;