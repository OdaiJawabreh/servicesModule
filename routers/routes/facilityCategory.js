const express = require("express");
const {
  addCategoryToFacility,
  getCategoriesByFacility,
  deleteCatgoryFromFacility,
  getParentsCategoryForSpacificCategory,
  addFacilityCategories
} = require("../controllers/facilityCategory");
const categotyFacility = express.Router();

categotyFacility.post("/addCategoryToFacility", addCategoryToFacility);
categotyFacility.post("/getCategoriesByFacility", getCategoriesByFacility);
categotyFacility.post("/deleteCatgoryFromFacility", deleteCatgoryFromFacility);
categotyFacility.post("/addFacilityCategories", addFacilityCategories);
categotyFacility.post(
  "/getParentsCategoryForSpacificCategory",
  getParentsCategoryForSpacificCategory
);

module.exports = categotyFacility;
