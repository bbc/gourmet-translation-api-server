const fetch = require("node-fetch");
const errorModels = require("./errorModels");
const utils = require("./utils");
const AbortController = require("abort-controller");
const en_tr_health = require("./static/en-tr-merged.json");
const tr_en_health = require("./static/tr-en-merged.json");

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
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
        console.log("Controller aborted. Fetch cancelled.");
      }, 25000);

      const body = (source === "tr" && { q, terminologyList: tr_en_health }) ||
        (target === "tr" && { q, terminologyList: en_tr_health }) || { q };

      return fetch(`${url}/translation`, {
        signal: controller.signal,
        method: "post",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => {
          return response.json();
        })
        .catch((error) => {
          console.error(
            `Failed to complete translation: ${source}-${target}:`,
            error
          );
          if (error.name === "AbortError") {
            return Promise.reject(
              new errorModels.TranslationServiceTimeoutError(
                `Translation service time out: ${source}-${target}`
              )
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
          console.log("Timeout cleared");
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
      if (response.error !== (null || undefined)) {
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
      } else {
        console.error(`Translation model failed with error: ${response.error}`);
        return new errorModels.TranslationServiceError(
          `Translation service failed: ${source}-${target}`
        );
      }
    })
    .catch((error) => {
      console.error(error);
      return error.response;
    });
};

module.exports = translate;
