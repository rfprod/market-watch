'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
        publicRepos: Number
	},
	stocks: {
	    codes: Array 
	}
});

module.exports = mongoose.model('User', User);
