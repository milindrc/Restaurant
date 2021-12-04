const express = require('express');
const router = express.Router();

const restaurant = require('../controllers/restaurant');

router.route("/")
  .get(restaurant.getAllRestaurants)
  .delete(restaurant.resetAllRestaurants);

router.route('/:id')
  .get(restaurant.getRestaurant)
  .post(restaurant.submitOrders);

router.route('/:id/single-order')
  .post(restaurant.submitSingleOrder);  

module.exports = router;