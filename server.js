var express = require('express');
var path = require('path');
var logger = require('morgan');
var fs = require("fs");
var app = express();
var _ = require('underscore')._;

//View Engine
console.log('View Engine loaded................');
app.set('views', path.join(__dirname, 'app'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'app')));

console.log('File sync................');
var data = fs.readFileSync('data/main.geojson');
data = JSON.parse(data);
console.log(data);
console.log('~~~~~~~~file sync complete~~~~~~~');

app.get('/', function(req, res) {
  res.render('index', {});
});
app.get('/map', function(req, res) {
  res.json(data);
});

  
app.listen(3000);