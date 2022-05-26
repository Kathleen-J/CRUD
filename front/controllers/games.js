const knex = require('knex');
const config = require('../../configs');
const {NotFoundError, InappropriateActionError, Forbidden} = require('../errors');
const {getRoleByLogin} = require('./users');

module.exports = {

  getGames: async (req, res)   => {
    const db = knex(config.development.database);
    const {login, password} = req.body;
    const {role} = await getRoleByLogin(login);
    const status = req.query.status;

    //если это Админ и в параметрах передано значене status = 'all' => отобразится статистика всех игроков
    //если это Админ и status !== 'all' или, если это пользователь => отобразятся личные игры

    if (role === 'Admin' && status === 'all') {

      const games = await db
        .select({
          id: 'g.id',
          winner: 'g.winner',
          createdAt: 'g.created_at',
          finishedAt: 'g.finished_at',
          playerOne: 'u1.login',
          playerTwo: 'u2.login'
        })
        .from({g: 'games'})
        .leftJoin({p1: 'players'}, {'g.id': 'p1.game_id', 'p1.number': 1})
        .leftJoin({u1: 'users'}, {'p1.user_id': 'u1.id'})
        .leftJoin({p2: 'players'}, {'g.id': 'p2.game_id', 'p2.number': 2})
        .leftJoin({u2: 'users'}, {'p2.user_id': 'u2.id'});
      res.status(200).json(games);

    } else if ( (role === 'Admin' && status !== 'all') || (role === 'User') ) {

      const [games] = await db
        .select({
          id: 'g.id',
          winner: 'g.winner',
          createdAt: 'g.created_at',
          finishedAt: 'g.finished_at',
          playerOne: 'u1.login',
          playerTwo: 'u2.login'
        })
        .from({g: 'games'})
        .where({'u1.login': login})
        .orWhere({'u2.login': login})
        .leftJoin({p1: 'players'}, {'g.id': 'p1.game_id', 'p1.number': 1})
        .leftJoin({u1: 'users'}, {'p1.user_id': 'u1.id'})
        .leftJoin({p2: 'players'}, {'g.id': 'p2.game_id', 'p2.number': 2})
        .leftJoin({u2: 'users'}, {'p2.user_id': 'u2.id'});
      res.status(200).json(games);

    } else {

      throw new Forbidden('Not enough rights');
    }

},

  getGame: async (req, res) => {
    const {gameId} = req.params;
    const db = knex(config.development.database);
    const game = await db
      .first({
        id: 'g.id',
        winner: 'g.winner',
        createdAt: 'g.created_at',
        finishedAt: 'g.finished_at',
        playerOne: 'u1.login',
        playerTwo: 'u2.login'
      })
      .from({g: 'games'})
      .leftJoin({p1: 'players'}, {'g.id': 'p1.game_id', 'p1.number': 1})
      .leftJoin({u1: 'users'}, {'p1.user_id': 'u1.id'})
      .leftJoin({p2: 'players'}, {'g.id': 'p2.game_id', 'p2.number': 2})
      .leftJoin({u2: 'users'}, {'p2.user_id': 'u2.id'})
      .where({'g.id': gameId});
    res.status(200).json(game);
  },

  createGame: async (req, res) => {
    const db = knex(config.development.database);
    const {userIds, size = 3} = req.body;

    if (!userIds || userIds.length !== 2) {
      throw new InappropriateActionError('invalid parameters passed');

      return;
    }

    const [{id: gameId}] = await db
      .into('games')
      .insert([{
        size
      }])
      .returning('id');

    await db
      .into('players')
      .insert(userIds.map(
        (userId, idx) => ({
          user_id: userId,
          game_id: gameId,
          number: idx + 1
        })
      ));

    res.status(200).json({gameId});
  },

  deleteGame: async (req, res) => {
    const {gameId} = req.params;
    const db = knex(config.development.database);

    const {finishedAt} = await db
      .first({finishedAt: 'finished_at'})
      .from('games')
      .where({id: gameId});

    if(finishedAt) {
      throw new InappropriateActionError('Unable to delete completed game');

      return;
    }

    await db
      .from('games')
      .update({
        deleted_at: new Date().toISOString()
      })
      .where({id: gameId});
    res.status(200);
  },

  updateGame: async (req, res) => {
    const {gameId} = req.params;
    const db = knex(config.development.database);

    const {deletedAt} = await db
      .first({deletedAt: 'deleted_at'})
      .from('games')
      .where({id: gameId});

    if(deletedAt) {
      throw new InappropriateActionError('Unable to change remote game');

      return;
    }

    const {winner} = req.body;

    if(!winner) {
      throw new InappropriateActionError('Impossible to change an unfinished game');

      return;
    }

    await db
      .from('games')
      .update({
        winner,
        finished_at: new Date().toISOString()
      })
      .where({id: gameId});
    res.status(200);

  }
};
