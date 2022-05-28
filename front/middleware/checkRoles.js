const {getRoleByLogin} = require('../controllers/users');
const {Forbidden, Unauthorized} = require('../errors');

const isAdmin = async (req, res, next) => {

  const {login, password} = req.user;
  const {role} = await getRoleByLogin(login);

   if (role === 'Admin') {
     next();
   } else {
     next(new Forbidden('Not enough rights'));
   }
};


//isAdminOrUser
const isAdminOrUser = async (req, res, next) => {

  const {login, password} = req.body;
  const {role} = await getRoleByLogin(login);

  if (role === 'Admin' || role === 'User') {
    next();
  } else {
    next(new Unauthorized('You need to log in'));
  }
};


// const isUser = async (req, res, next) => {
//
//   const {login, password} = req.body;
//   const {role} = await getRoleByLogin(login);
//
//   if (role === 'User') {
//     next();
//   } else {
//     next(new Forbidden('Not enough rights')); //You need to log in?
//   }
// };



module.exports = {
  isAdmin,
  isAdminOrUser
};
