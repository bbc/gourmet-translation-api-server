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
    });
  }
}

class TranslationServiceError extends TranslationError {
  constructor(message) {
    super(message, {
      statusCode: 500,
      body: JSON.stringify({
        errors: [message],
      }),
    });
  }
}

module.exports = { InvalidInputError, TranslationServiceError };
