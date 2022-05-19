const knex = require('knex');
const config = require('../../configs');
const {NotFoundError, InappropriateActionError} = require('../errors');

module.exports = {
  getGames: async (req, res)   => {
    const db = knex(config.development.database);
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
