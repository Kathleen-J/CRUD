const knex = require('knex');
const config = require('../../configs');

module.exports = {

  getStatistics: async (req, res) => {
    // const limit = Number(req.query.limit) || 5;
    // const offset = Number(req.query.offset) || 0;
    const db = knex(config.development.database);
    const statistics = await db
      .select({
        login: 'login',
        total: db.raw('(wins + loses + draws)::integer'),
        wins: db.raw('wins::integer'),
        loses: db.raw('loses::integer'),
        winRate: db.raw('wins::float / (wins + loses + draws)')
      })
      .from({
        statistics: db
          .select({
            login: 'u.login',
            wins: db.raw('count(p.number = g.winner or null)'),
            loses: db.raw('count(p.number <> g.winner and g.winner is not null or null)'),
            draws: db.raw('count(g.winner is null or null)')
          })
          .from({g: 'games'})
          .leftJoin({p: 'players'}, {'g.id': 'p.game_id'})
          .leftJoin({u: 'users'}, {'p.user_id': 'u.id'})
          .groupBy('u.login')
      })
      .orderBy('winRate', 'desc');
      res.status(200).json(statistics);
  }

};
