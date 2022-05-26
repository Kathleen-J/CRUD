const catchErrors = require('./catchErrors');
const {  isAdminOrUser, isAdmin } = require('./checkRoles');

module.exports = {
  catchErrors,
  isAdmin,
  isAdminOrUser
};
