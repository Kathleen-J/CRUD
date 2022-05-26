class Unauthorized extends Error {
  cause;

  constructor(cause) {
    super(`Inappropriate action because of '${cause}'`);
    this.cause = cause;
  }
}

module.exports = Unauthorized;
