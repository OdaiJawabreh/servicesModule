let axios = require("axios");
// const {  app } = require('../config/parameters')
const dispatcher = async ({ uri, body }) => {
  try {
    let url = process.env.API_GATEWAY_URL + "/AOC" + uri; 
    let request = await axios({
      url: url,
      method: "POST",
      data: body,
      headers: { workspace: "CLK-WEB-88447876-4696-4417-b985-f14a725c0ee1", passmein: true , "accept-encoding":"*", contentType:"*"},
    });
    return request;
  } catch (error) {
    // console.log(error.request);
    // console.log(error.response);
    throw error;
  }
};
module.exports = {dispatcher};