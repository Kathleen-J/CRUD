const knex = require('knex');
const config = require('../../configs');

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
      updated: 'updated_at',
      role: 'role'
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
      updated: 'updated_at',
      role: 'role'
    })
    .from('users')
    .where({id});

    return query;
  },

  async getRoleByLogin(login) {

    const db = knex(config.development.database);
    const query = await db
    .first({
      role: 'role'
    })
    .from('users')
    .where({login});

    return query;

  }

}
