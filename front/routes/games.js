const {Router} = require('express');
const {catcher} = require('../utils/catcher');
const {getGames, createGame, getGame, deleteGame, updateGame} = require('../controllers/games');
const {isAdmin, isAdminOrUser} = require('../middleware');

const router = Router();

router.get('/', catcher(getGames));
router.get('/:gameId', isAdmin, catcher(getGame));
router.post('/', isAdmin, catcher(createGame));
router.delete('/:gameId', isAdmin, catcher(deleteGame));
router.put('/:gameId', isAdmin, catcher(updateGame));

module.exports = router;
