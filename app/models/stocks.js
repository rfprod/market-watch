'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stock = new Schema({
	_id: String,
    data: Array
});

module.exports = mongoose.model('Stock', Stock);
