module.exports = {

  development: {
    server: {
      port: 8080
    },
    database: {
      client: 'postgresql',
      connection: {
        database: 'route',
        user: 'route',
        password: '123',
        host: 'localhost',
        port: '5432'
      },
      migrations: {
        directory: './db/migrations'
      },
      seeds: {
        directory: './db/seeds'
      }
    }
  }


// staging: {
//   client: 'postgresql',
//   connection: {
//     database: 'route',
//     user:     'route',
//     password: '123'
//   },
//   pool: {
//     min: 2,
//     max: 10
//   },
//   migrations: {
//     tableName: 'knex_migrations'
//   }
// },

// production: {
//   client: 'postgresql',
//   connection: {
//     database: 'route',
//     user:     'route',
//     password: '123'
//   },
//   pool: {
//     min: 2,
//     max: 10
//   },
//   migrations: {
//     tableName: 'knex_migrations'
//   }
// }

};
