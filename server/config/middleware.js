var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var energyRoutes = require('../wattTime/energyRoutes');
var smartBulbRoutes = require('../smartBulb/smartBulbRoutes');
var utilityAPIRoutes = require('../utilityAPI/utilityAPIRoutes');
var userRoutes = require('../users/userRoutes');


module.exports = function(app){ 
  app.use(bodyParser.json());
  app.use(morgan('dev'));


  app.use(express.static(__dirname + '/../../build'));

  // Routes
  energyRoutes(app);
  utilityAPIRoutes(app);
  userRoutes(app);
  smartBulbRoutes(app);

};