const express = require("express");
const app = express();
const cors = require("cors");

const { sequelize } = require("./models/index");
// sequelize.sync({force: true}).then(() => {
sequelize.sync({ alter: true }).then(() => {
  console.log("db successfully");
});
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT;

// import Routes
const category = require("./routers/routes/category");
const categoryFacility = require("./routers/routes/facilityCategory");
const services = require("./routers/routes/services");
const serviceTools = require("./routers/routes/serviceTools");
const serviceEquipments = require("./routers/routes/serviceEquipments");
const serviceAssistants = require("./routers/routes/serviceAssistants");
const serviceProviders = require("./routers/routes/serviceProviders");
const followUpServices = require("./routers/routes/followUpServices");
const packages = require("./routers/routes/packages");
const diagnosis = require("./routers/routes/diagnosis");
const medicine = require("./routers/routes/medicine");
const careValidation = require("./routers/routes/careValidation");
const settings = require("./routers/routes/settings");
const serviceRooms = require("./routers/routes/serviceRooms")
const facilityService = require("./routers/routes/facilityServices")
// app.use
app.use("/services/category", category);
app.use("/services/facility", categoryFacility);
app.use("/services", services);
app.use("/services/tools", serviceTools);
app.use("/services/equipments", serviceEquipments);
app.use("/services/assistants", serviceAssistants);
app.use("/services/providers", serviceProviders);
app.use("/services/followUp", followUpServices);
app.use("/services/packages", packages);
app.use("/services/diagnosis", diagnosis);
app.use("/services/medicine", medicine);
app.use("/services/careValidation", careValidation);
app.use("/services/settings", settings);
app.use("/services/rooms", serviceRooms);
app.use("/services/facilityServices", facilityService);


app.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});
