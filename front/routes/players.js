const {Router} = require('express');
const {catcher} = require('../utils/catcher');
const {getPlayers, deletePlayer, createPlayer, updatePlayer} = require('../controllers/players');

const router = Router();

router.get('/', catcher(getPlayers));
router.post('/', catcher(createPlayer));
router.delete('/:playerId', catcher(deletePlayer));
router.put('/:playerId', catcher(updatePlayer));

module.exports = router;
