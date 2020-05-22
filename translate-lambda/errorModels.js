class TranslationError extends Error {
  constructor(message, response) {
    super(message);
    this.response = response;
  }
}

class InvalidInputError extends TranslationError {
  constructor(message) {
    super(message, {
      statusCode: 400,
      body: JSON.stringify({
        errors: [message],
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      },
    });
  }
}

class TranslationServiceError extends TranslationError {
  constructor(message) {
    super(message, {
      statusCode: 502,
      body: JSON.stringify({
        errors: [message],
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      },
    });
  }
}

class TranslationServiceTimeoutError extends TranslationError {
  constructor(message) {
    super(message, {
      statusCode: 504,
      body: JSON.stringify({
        errors: [message],
      }),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      },
    });
  }
}

module.exports = {
  InvalidInputError,
  TranslationServiceError,
  TranslationServiceTimeoutError,
};
