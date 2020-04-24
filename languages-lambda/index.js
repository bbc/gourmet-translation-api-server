const languagePairs = require("./languagePairs")

exports.handler = async (event) => {
    const response = {
        statusCode: 200,
        body: JSON.stringify(languagePairs)
    };
    return response;
};