const {InappropriateActionError, NotFoundError} = require('../errors');

const catchErrors = (err, req, res, next) => {

  console.log(err.message);
  if (err instanceof NotFoundError) {
    res.status(404).json({error: err.message, entity: err.entity, entityId: err.entityId});
    res.end();
  } else if (err instanceof InappropriateActionError) {
    res.status(400).json({error: err.message, cause: err.cause});
    res.end();
  } else {
    res.status(500).json({error: 'Server Error'});
    res.end();
  }
};

module.exports = catchErrors;
