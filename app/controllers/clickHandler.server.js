'use strict';
var Usrs = require('../models/users.js');
function ClickHandler () {
	this.getClicks = function (req, res) {
		Usrs.findOne({ 'github.id': req.user.github.id }, { '_id': false })
			.exec(function (err, result) {
				if (err) { throw err; }
				res.json(result.rsvp);
			});
	};
	this.addClick = function (req, res) {
		//console.log(req.body);
		/*
		Usrs.findOne({ 'github.id': req.user.github.id }, { '_id': false })
			.exec(function (err, result) {
				if (err) { throw err; }
				res.json(result.rsvp);
			});
		*/
		/*
		Usrs.findOneAndUpdate({ 'github.id': req.user.github.id }, { $inc: { 'nbrClicks.clicks': 1 } })
			.exec(function (err, result) {
				if (err) { throw err; }
				res.json(result.rsvp);
			});
			*/
	};
	this.resetClicks = function (req, res) {
		Usrs.findOne({ 'github.id': req.user.github.id }, { '_id': false })
			.exec(function (err, result) {
				if (err) { throw err; }
				res.json(result.rsvp);
			});
		/*
		Usrs.findOneAndUpdate({ 'github.id': req.user.github.id }, { 'nbrClicks.clicks': 0 })
			.exec(function (err, result) {
				if (err) { throw err; }
				res.json(result.rsvp);
			});
			*/
	};
}
module.exports = ClickHandler;
