const knex = require('knex');
const bcrypt = require('bcrypt');
const config = require('../../configs');
const {NotFoundError, InappropriateActionError, Forbidden} = require('../errors');
const {getRoleByLogin} = require('./users');

module.exports = {

  getPlayers: async (req, res) => {
    const status = req.query.status;
    const {login, password} = req.body;
    const {role} = await getRoleByLogin(login);
    const db = await knex(config.development.database);

    //если это Админ и в параметрах передано значене status = 'all' => отобразятся все игроки
    //если это Админ и status !== 'all' или, если это пользователь => отобразятся активные игроки

    if (role === 'Admin' && status === 'all') {

      const query = db
        .select({
          id: 'u.id',
          login: 'u.login',
          status: 'u.status',
          createdAt: 'u.created_at',
          updatedAt: 'u.updated_at'
        })
        .from({u: 'users'});

      const users = await query;
      res.status(200).json(users);

    } else if ( (role === 'Admin' && status !== 'all') || (role === 'User') ) {

      const query = db
        .select({
          id: 'u.id',
          login: 'u.login',
          status: 'u.status',
          createdAt: 'u.created_at',
          updatedAt: 'u.updated_at'
        })
      .from({u: 'users'})
      .where({'u.status': 'active'});

      const users = await query;
      res.status(200).json(users);

    } else {

      throw new Forbidden('Not enough rights');
    }

  },

  deletePlayer: async (req, res) => {
    const {playerId, statusUser = 'deleted'} = req.body;
    const db = knex(config.development.database);

    //блокируем пользователя, если был передан только id и ничего, кроме id
    //или, если был передан id и статус и ничего больше, кроме этих параметров
    //если в запросе все же был передан статус, то его значение должно быть только 'deleted'
    if ( req.body.playerId && (Object.keys(req.body).length < 2) ) {
      await db
      .from('users')
      .update({
        status: statusUser,
        updated_at: new Date().toISOString()
      })
      .where({id: playerId});
      res.status(200);

      return;

    } else if ( (req.body.playerId && req.body.statusUser && Object.keys(req.body).length < 3) ) {
        if (statusUser === 'deleted') {
          await db
          .from('users')
          .update({
            status: statusUser,
            updated_at: new Date().toISOString()
          })
          .where({id: playerId});
          res.status(200);

          return;
        } else {
          throw new InappropriateActionError('wrong status');

          return;
        }
    } else {
      throw new InappropriateActionError('invalid parameters passed');

        return;
      }

  },

  createPlayer: async (req, res) => {

    const db = knex(config.development.database);
    const passWord = 'PassWord';
    const {loginUser, statusUser = 'active'} = req.body;

    //создаем пользователя, если был передан только логин и ничего, кроме него
    //или, если был передан логин и статус и ничего больше, кроме этих параметров
    //если в запросе все же был передан статус, то его значение должно быть либо 'deleted', либо 'active'
    if (req.body.loginUser && (Object.keys(req.body).length < 2)) {
      await db
      .into('users')
      .insert([{
        login: loginUser,
        password: await bcrypt.hash(passWord, 8),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: statusUser,
        role: 'User'
      }]);
      res.status(200).json({loginUser});

      return;
    } else if ( req.body.loginUser && req.body.statusUser && (Object.keys(req.body).length < 3) ) {
      if (statusUser === 'active' || statusUser === 'deleted') {
        await db
        .into('users')
        .insert([{
          login: loginUser,
          password: await bcrypt.hash(passWord, 8),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: statusUser,
          role: 'User'
        }]);
        res.status(200).json({loginUser});

        return;
      } else {
        throw new InappropriateActionError('wrong status');

        return;
      }
    } else {
      throw new InappropriateActionError('invalid parameters passed');

      return;
    }

  },

  updatePlayer: async (req, res) => {

    const {playerId, passwordUser, statusUser = 'active'} = req.body;
    const db = knex(config.development.database);

    if (!playerId) {
      throw new InappropriateActionError('invalid parameters passed');
    }

    //get status for check
    const {status} = await db
    .first({status: 'status'})
    .from('users')
    .where({id: playerId});

    //если был передан только id и ничего, кроме него => меняем статус на 'active'
    //или, если был передан id и статус и ничего больше, кроме этих параметров => меняем статус на 'active' (значение статуса должно быть 'active')
    //если в запросе был передан id и пароль => меняем пароль при условии, что статус пользователя 'active'
    if ( req.body.playerId && (Object.keys(req.body).length < 2) ) {

      await db
      .from('users')
      .update({
        status: statusUser,
        updated_at: new Date().toISOString()
      })
      .where({id: playerId});
      res.status(200);

      return;
    } else if ( req.body.playerId && req.body.statusUser && (Object.keys(req.body).length < 3) ) {

      if (statusUser === 'active') {
        await db
        .from('users')
        .update({
          status: statusUser,
          updated_at: new Date().toISOString()
        })
        .where({id: playerId});
        res.status(200);

        return;
      } else {
        throw new InappropriateActionError('wrong status');

        return;
      }
    } else if(req.body.playerId && req.body.passwordUser && Object.keys(req.body).length < 3) {
      //сменить пароль можно только у пользователя со статусом 'active'
      if (status === 'active') {
          await db
          .from('users')
          .update({
            password: await bcrypt.hash(passwordUser, 8),
            updated_at: new Date().toISOString()
          })
          .where({id: playerId});
          res.status(200);

          return;
      } else {
        throw new InappropriateActionError('Impossible to change password for locked user');

        return;
      }
    } else {
      throw new InappropriateActionError('invalid parameters passed');

      return;
    }

    /*P.S. пароль не обновится, т.к. условия не позволяют сменить пароль удаленным пользователям.
    Для активных пользователей доступна только кнопка "заблокировать", а это уже отдельный контроллер deletePlayer,
    + отдельной кнопки для смены пароля нет на фронте.
    В дальнейшем нужнен будет отдельный контроллер, + функция на фронте для обработки данного запроса
    */

  }

};
