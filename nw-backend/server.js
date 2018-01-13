var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    morgan = require('morgan'),
    restful = require('node-restful');

var app = module.exports = express();
//var mConnect = mongoose.connect('mongodb://thebuzzers:cs310project@ds059145.mongolab.com:59145/comicbuzzdb');
var mConnect = mongoose.connect("mongodb://nw-test:test1000002@ds255347.mlab.com:55347/nwhacks2018");

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());

app.listen(3000);
