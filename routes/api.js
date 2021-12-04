const express = require('express');
const router = express.Router();

const restaurant = require('./restaurant')

router.use('/restaurant', restaurant);

module.exports = router;