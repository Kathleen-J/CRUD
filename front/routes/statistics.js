const {Router} = require('express');
const {catcher} = require('../utils/catcher');
const {getStatistics} = require('../controllers/statistics');
const {isAdmin, isAdminOrUser} = require('../middleware');

const router = Router();

router.get('/', isAdminOrUser, catcher(getStatistics));

module.exports = router;
