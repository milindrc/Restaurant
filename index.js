const express = require('express');
const appSetup = require('./config/app-setup');

const app = express();

appSetup(app);

app.listen(3000, () => {
  console.log('server started');
});
