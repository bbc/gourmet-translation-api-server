const fetch = require("node-fetch");
const errorModels = require("./errorModels");
const utils = require("./utils");
const AbortController = require("abort-controller");

const controller = new AbortController();
const timeout = setTimeout(() => {
  controller.abort();
}, 25000);

const translationRequest = (q, source, target) => {
  if (q === undefined || source === undefined || target === undefined) {
    return Promise.reject(
      new errorModels.InvalidInputError(
        `"q", "source" and "target" must all be defined in the request body`
      )
    );
  } else {
    const url = utils.getTranslationModelURL(source, target);
    if (url === undefined) {
      return Promise.reject(
        new errorModels.InvalidInputError(
          `Cannot translate from ${source} to ${target}. Language pair does not exist.`
        )
      );
    } else {
      return fetch(`${url}/translation`, {
        signal: controller.signal,
        method: "post",
        body: JSON.stringify({ q }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .catch((error) => {
          if (error.name === "AbortError") {
            return new errorModels.TranslationServiceTimeoutError(
              `Translation service time out: ${source}-${target}`
            );
          } else {
            return Promise.reject(
              new errorModels.TranslationServiceError(
                `Translation service failed: ${source}-${target}`
              )
            );
          }
        })
        .finally(() => {
          clearTimeout(timeout);
        });
    }
  }
};

const translate = (request) => {
  const body = JSON.parse(request.body);
  const source = body.source;
  const target = body.target;
  const q = body.q;

  return translationRequest(q, source, target)
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
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        },
      };
    })
    .catch((error) => {
      console.error(error);
      return error.response;
    });
};

module.exports = translate;
