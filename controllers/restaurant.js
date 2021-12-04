const restaurantHelper = require('../helpers/restaurant');
const responseHandler = require('../utils/responseHandler');

exports.getAllRestaurants = (req, res) => {
  restaurantHelper.getAllRestaurants()
    .then(result => responseHandler.positiveResponse(res, result));
}

exports.resetAllRestaurants = (req, res) => {
  restaurantHelper.resetAllRestaurants()
    .then(result => responseHandler.positiveResponse(res, result))
    .catch(err => {
      responseHandler.negativeResponse(res, err)
    });
}

exports.getRestaurant = (req, res) => {
  restaurantHelper.getRestaurant(req.params.id)
    .then(result => responseHandler.positiveResponse(res, result))
    .catch(err => {
      responseHandler.negativeResponse(res, err)
    });
}

exports.submitSingleOrder = (req, res) => {
  restaurantHelper.getRestaurant(req.params.id)
    .then(restaurant => {
      return restaurantHelper.submitSingleOrder(restaurant, req.body);
    }).then(result => {
      responseHandler.positiveResponse(res, result, result)
    }).catch(err => {
      responseHandler.negativeResponse(res, err)
    });
}

exports.submitOrders = (req, res) => {
  restaurantHelper.getRestaurant(req.params.id)
    .then(restaurant => {
      return restaurantHelper.submitAllOrders(restaurant, req.body);
    }).then(result => {
      responseHandler.positiveResponse(res, result, "Orders Processed")
    }).catch(err => {
      responseHandler.negativeResponse(res, err)
    });
}