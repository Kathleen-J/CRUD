const {Router} = require('express');
const statistics = require('./statistics');
const players = require('./players');
const games = require('./games');
const users = require('./users');

const router = Router();

router.use('/statistics', statistics);
router.use('/players', players);
router.use('/games', games);
router.use('/users', users);

module.exports = router;
