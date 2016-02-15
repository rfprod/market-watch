'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stock = new Schema({
	publicStocks: {
	    codes: Array 
	}
});

module.exports = mongoose.model('Stock', Stock);
