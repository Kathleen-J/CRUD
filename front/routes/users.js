const {Router} = require('express');
const {catcher} = require('../utils/catcher');
const {getUserByLogin} = require('../controllers/users');

const router = Router();

// router.get('/', catcher(getPlayers));
// router.post('/', catcher(getUserByLogin));
// router.delete('/:playerId', catcher(deletePlayer));
// router.put('/:playerId', catcher(updatePlayer));

module.exports = router;