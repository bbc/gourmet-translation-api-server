const translate = require("./translate");

exports.handler = async (event) => {
  return translate(event);
};
