const Handlebars = require("handlebars");

Handlebars.registerHelper("base64", function (data) {
  return data.toString("base64");
});
