const languagePairs = require("./languagePairs");

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(languagePairs),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    },
  };
  return response;
};
