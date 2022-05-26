const {Router} = require('express');
const {catcher} = require('../utils/catcher');
const {getPlayers, deletePlayer, createPlayer, updatePlayer} = require('../controllers/players');
const {isAdmin, isAdminOrUser} = require('../middleware');

const router = Router();

router.get('/', catcher(getPlayers));
router.post('/', isAdmin, catcher(createPlayer));
router.delete('/:playerId', isAdmin, catcher(deletePlayer));
router.put('/:playerId', isAdmin, catcher(updatePlayer));

module.exports = router;
