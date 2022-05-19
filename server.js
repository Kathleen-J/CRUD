const express = require('express');
const routes = require('./front/routes');
const config = require('./configs')
const {catchErrors} = require('./front/middleware');
//const passport = require('passport');
// const {Strategy, ExtractJwt} = require('passport-jwt');

const app = express();

// const strategy = new Strategy(
//   {
//      secretOrKey: 'secret',
//      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
//   },
//   async (payload, done) => {
//    try {
//      const user = await findUser(payload.sub);
//
//      if (user) {
//        done(null, user);
//      } else {
//        done(null, false);
//      }
//    } catch (e)  {
//       done(e, false);
//    }
//  }
// );

//passport.use(strategy);

app.use(express.json());  //парсинг JSON
// app.use( (req, res, next) => {
//   console.log(req.url);
//   next();
// });
app.use(express.static(__dirname + '/front/app'));
//app.use(passport.initialize());
//  app.use('/api', passport.authenticate('jwt', {session: false}), routes);
app.use('/api', routes);

//app.use('/token', (req, res) => {
//  const {login, password} = req.body;
//
//});

//все, что не подходит под предыдущие роуты будет считаться фронтендом
app.get('*', (req, res) => {res.sendFile(__dirname + '/front/app/index.html');});
app.use(catchErrors);

app.listen(8080, console.log('listen port: 8080'));
