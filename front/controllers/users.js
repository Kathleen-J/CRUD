const knex = require('knex');
const bcrypt = require('bcrypt');
const config = require('../../configs');
const {NotFoundError, InappropriateActionError} = require('../errors');

module.exports = {
    
  async getUserByLogin(login) {

    const db = knex(config.development.database);
    const query = await db
    .first({
      id: 'id',
      login: 'login',
      password: 'password',
      status: 'status',
      created: 'created_at',
      updated: 'updated_at'
    })
    .from('users')
    .where({login});

    return query;
  },

  async getUserId(id) {


    const db = knex(config.development.database);
    const query = await db
    .first({
      id: 'id',
      login: 'login',
      password: 'password',
      status: 'status',
      created: 'created_at',
      updated: 'updated_at'
    })
    .from('users')
    .where({id});
    
    return query;
  }

}
