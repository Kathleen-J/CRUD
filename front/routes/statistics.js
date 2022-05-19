const {Router} = require('express');
const {catcher} = require('../utils/catcher');
const {getStatistics} = require('../controllers/statistics');

const router = Router();

router.get('/', catcher(getStatistics));

module.exports = router;
