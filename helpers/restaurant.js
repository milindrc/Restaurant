const db = require('../utils/database');

const model = (id) => ({
  id,
  queue:[],
  orders:[],
  slotLimit:7,
  deliveryLimit: 150,
  distanceTime: 8,
});

const itemSlots = {
  "A": 1,
  "M": 2,
};

const itemTimings = {
  "A": 17,
  "M": 29,
};

exports.getRestaurant = (restId) => {
  return db.get(restId).then(rest => {
    if(rest){
      return rest;
    } else {
      return db.set(restId, model(restId))
        .then(() => {
          return db.get(restId);
        })
    }
  })
}

exports.getAllRestaurants = () => {
  return db.list().then(keys => {
    let tasks = keys.map(key => db.get(key));
    return Promise.all(tasks);
  });
}

exports.resetAllRestaurants = () => {
  return db.list().then(keys => {
    let tasks = keys.map(key => db.delete(key));
    return Promise.all(tasks);
  });
}

function getMinTimeToStart(rest, requiredSlots){
  if(rest.queue.length){
    const last = rest.queue[rest.queue.length-1];
    return last.time + last.startTime;
  }
  
  let sorted = rest.orders.sort((a, b) => {
      return a.time - b.time;
  });
  
  let time = 0;
  for(let i=0;i<sorted.length;i++){
    time += sorted[i].time;
    requiredSlots -= sorted[i].slots;

    if(requiredSlots<=0){
      return time;
    }
  }
}

exports.submitAllOrders = (rest, data) => {
  const usedSlots = rest.orders.reduce((acc, order) => acc + order.slots, 0);
  let availableSlots = rest.slotLimit - usedSlots;

  let results=[];
  data.forEach(order => {
    const requiredTime = order.meals.reduce((acc, item) => Math.max(acc,itemTimings[item]), 0)
    + (order.distance * rest.distanceTime);
    
    const requiredSlots = order.meals.reduce((acc, item) => acc + itemSlots[item], 0);

    if(requiredSlots > rest.slotLimit){
      results.push(`Order ${order.orderId} is denied because the restaurant cannot accommodate it`)
    } else if (availableSlots>=requiredSlots){
      availableSlots -= requiredSlots;
      rest.orders.push({
        orderId: order.orderId,
        slots: requiredSlots,
        time: requiredTime,
      })
      results.push(`Order ${order.orderId} will get delivered in ${requiredTime} minute`)
    } else {
      let minTime = getMinTimeToStart(rest, requiredSlots);
      if(minTime + requiredTime > rest.deliveryLimit){
        results.push(`Order ${order.orderId} is denied because the restaurant is operating at full capacity`)
      } else {
        rest.queue.push({
          orderId: order.orderId,
          slots: requiredSlots,
          time: requiredTime,
          startTime: minTime,
        })
        results.push(`Order ${order.orderId} will get delivered in ${requiredTime+minTime} minute`)
      }
    }
  })
  return db.set(rest.id, rest)
    .then(() => {
      return results;
    })
}


exports.submitSingleOrder = (rest, order) => {
  const usedSlots = rest.orders.reduce((acc, order) => acc + order.slots, 0);
  let availableSlots = rest.slotLimit - usedSlots;

  const requiredTime = order.meals.reduce((acc, item) => Math.max(acc,itemTimings[item]), 0)
  + (order.distance * rest.distanceTime);
    
  const requiredSlots = order.meals.reduce((acc, item) => acc + itemSlots[item], 0);

  let message = "";
  if(requiredSlots > rest.slotLimit){
    message = `Order ${order.orderId} is denied because the restaurant cannot accommodate it`;
  } else if (availableSlots>=requiredSlots){
    rest.orders.push({
      orderId: order.orderId,
      slots: requiredSlots,
      time: requiredTime,
    })
    message = `Order ${order.orderId} will get delivered in ${requiredTime} minute`;
  } else {
    let minTime = getMinTimeToStart(rest, requiredSlots);
    if(minTime + requiredTime > rest.deliveryLimit){
      message = `Order ${order.orderId} is denied because the restaurant is operating at full capacity`;
    } else {
      rest.queue.push({
        orderId: order.orderId,
        slots: requiredSlots,
        time: requiredTime,
        startTime: minTime,
      })
      message = `Order ${order.orderId} will get delivered in ${requiredTime+minTime} minute`;
    }
  }

  return db.set(rest.id, rest)
    .then(() => {
      return message;
    })
}