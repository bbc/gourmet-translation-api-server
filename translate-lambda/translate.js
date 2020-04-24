const fetch = require("node-fetch");
const errorModels = require("./errorModels");
const utils = require("./utils");

const translationRequest = (url, q, source, target) => {
  if (q === undefined || source === undefined || target === undefined) {
    return Promise.reject(
      new errorModels.InvalidInputError(
        `"q", "source" and "target" must all be defined in the request body`
      )
    );
  } else {
    if (url === undefined) {
      return Promise.reject(
        new errorModels.InvalidInputError(
          `Cannot translate from ${source} to ${target}. Language pair does not exist.`
        )
      );
    } else {
      return fetch(`${url}/translation`, {
        method: "post",
        body: JSON.stringify({ q }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .catch((error) => {
          return Promise.reject(
            new errorModels.TranslationServiceError(
              `Translation service failed: ${source}-${target}`
            )
          );
        });
    }
  }
};

const translate = (request) => {
  const body = JSON.parse(request.body);
  const source = body.source;
  const target = body.target;
  const q = body.q;

  const translationUrl = utils.getTranslationModelURL(source, target);
  return translationRequest(translationUrl, q, source, target)
    .then((response) => {
      console.info(
        `Translate ${source} to ${target}. In ${response.time_taken}ms. Result: ${response.result}`
      );
      return {
        statusCode: 200,
        body: JSON.stringify({
          translatedText: response.result,
          source,
          target,
        }),
      };
    })
    .catch((error) => {
      console.error(error);
      return error.response;
    });
};

module.exports = translate;
