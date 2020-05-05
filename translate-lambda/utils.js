const portForEachLanguagePairModel = require("../portForEachLanguagePairModel.js");

const getTranslationModelURL = (source, target) => {
  const baseUrl =
    "***REMOVED***";

  port = portForEachLanguagePairModel[source][target];
  if (port === undefined) {
    console.error(
      `Translation model does not exist for language pair: ${source}-${target}`
    );
    return undefined;
  } else {
    const url = `${baseUrl}:${port}`;
    return url;
  }
};

module.exports = { getTranslationModelURL };
