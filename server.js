const express = require('express');
const routes = require('./front/routes');
const config = require('./configs');
const {catchErrors} = require('./front/middleware');
const passport = require('passport');
const {Strategy, ExtractJwt} = require('passport-jwt');
const bcrypt = require('bcrypt');
const {catcher} = require('./front/utils/catcher');
const jwt = require('jsonwebtoken');
const {getUserByLogin, getUserId, getRoleByLogin} = require('./front/controllers/users');

const app = express();

const strategy = new Strategy(

  {
     secretOrKey: 'secret',
     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  },

  async (payload, done) => {
   try {
     const user = await getUserId(payload.sub);
     //const user = await getUserId(payload.sub.id);
     if (user) {
       done(null, user);
     } else {
       done(null, false);
     }
   } catch (e)  {
      done(e, false);
   }
 }

);

passport.use(strategy);
app.use(express.json());
/*
// app.use( (req, res, next) => {
//   console.log(req.url);
//   next();
// });
*/
app.use(express.static(__dirname + '/front/app'));
app.use(passport.initialize());
app.use('/api', passport.authenticate('jwt', {session: false}), routes);
// app.use('/api', routes);

app.post('/token', catcher(async (req, res) => {
 try {
    // const {login, password, role} = req.body;
    const {login, password} = req.body;
    // const {role} = await getRoleByLogin(login);
    //const {isAdmin, isAdminOrUser} = require('./front/middleware');
    //if (role === 'Admin') {}
    //if (role === 'User') {}
    const user = await getUserByLogin(login);
    const isEqual = await bcrypt.compare(password, user.password);

    if (isEqual) {
      res
       .status(200)
       .json({token: jwt.sign({sub: user.id}, 'secret')});
       //.json({token: jwt.sign({sub:{id: user.id, role: user.role}}, 'secret')});
    } else {
      res
       .status(400)
       .json({error: 'Wrong password'});
    }
} catch (e) {
    console.log(e.message);
}

}));

//все, что не подходит под предыдущие роуты будет считаться фронтендом
app.get('*', (req, res) => {res.sendFile(__dirname + '/front/app/index.html');});
app.use(catchErrors);

app.listen(8080, console.log('listen port: 8080'));
