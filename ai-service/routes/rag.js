const express = require('express');
const router = express.Router();
const ragController = require('../controllers/ragController');

router.post('/index', ragController.indexVideo);
router.post('/search', ragController.search);
router.get('/stats', ragController.stats);

module.exports = router;