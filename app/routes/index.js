'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var clickHandler = new ClickHandler();

var Usrs = require('../models/users.js');

module.exports = function (app, passport, jsdom, fs) {
	
	var jquerySource = fs.readFileSync(path + "/public/js/jquery.min.js", "utf-8");
	var serializeDocument = jsdom.serializeDocument;
	var htmlUIuniformDropdownOption = "<option value='one'>One</option>";

	function isLoggedIn(req, res, next){
		if (req.isAuthenticated()) return next();
		else res.redirect('/login');
	}
	function isLoggedInBool(req, res, next){
		if (req.isAuthenticated()) return true;
		else return false;
	}

	app.route('/').get(function (req, res) {
		Usrs.find({}, function(err, docs) {
		    if (err) throw err;
	        if (docs.length == 0) console.log('users do not exist: '+JSON.stringify(docs));
	        else console.log('users exist: '+JSON.stringify(docs));
		});
		var htmlNavAuthed = "<li class='nav-pills active'><a href='#app'><span class='glyphicon glyphicon-search'></span> Find Venues</a></li><li class='nav-pills'><a href='/profile'><span class='glyphicon glyphicon-user'></span> My Profile</a></li><li class='nav-pills'><a href='/logout'><span class='glyphicon glyphicon-remove'></span> Logout</a></li>";
		var htmlNavNotAuthed = "<li class='nav-pills active'><a href='/'><span class='glyphicon glyphicon-search'></span> Find Venues</a></li><li class='nav-pills'><a href='/login'><span class='glyphicon glyphicon-user'></span> Login with Github</a></li>";
		var htmlSourceIndex = null;
		var venueTemplate = null;
		fs.readFile(path + "/app/models/venue.html","utf-8", function(err,data){
			if (err) throw err;
			venueTemplate = data;
			fs.readFile(path + "/public/index.html", "utf-8", function (err,data) {
				if (err) throw err;
			  	htmlSourceIndex = data;
			  	jsdom.env({
					html: htmlSourceIndex,
					src: [jquerySource],
					done: function (err, window) {
						if (err) throw err;
						var $ = window.$;
						console.log("index page DOM successfully retrieved");
						if (isLoggedInBool(req, res)) $('.navbar-right').html(htmlNavAuthed);
						else $('.navbar-right').html(htmlNavNotAuthed);
						$('.venues').append(venueTemplate);
						var userVenues = "";
						
						if (isLoggedInBool(req, res)) {
							Usrs.findOne({ 'github.id': req.user.github.id }, function(err, docs) {
							    if (err) throw err;
							    userVenues = docs.rsvp.venues;
								console.log('user RSVPs: '+JSON.stringify(userVenues));
								/*for (var i=0;i<venueIDs.length;i++){
					        		pollId = "poll-"+docs[i]._id;
					        		pollName = docs[i].displayName;
									$('.poll-heading').last().html(pollName);
									$('.poll-heading').last().attr('href','#'+pollId);
									$('.poll-internals').last().attr('id',pollId);
					        	}*/
								console.log("index page DOM manipulations complete");
								var newHtml = serializeDocument(window.document);
								res.send(newHtml);
								window.close();
							});
						}else{
							console.log("index page DOM manipulations complete");
							var newHtml = serializeDocument(window.document);
							res.send(newHtml);
							window.close();
						}
					}
				});
			});
		});
	});
	app.route('/login').get(function (req, res) {res.sendFile(path + '/public/login.html');});
	app.route('/logout').get(function (req, res) {
		req.logout();
		res.redirect('/login');
	});
	app.route('/profile').get(isLoggedIn, function (req, res) {
		var currentUserPass = req.session.passport.user;
		/*
		Usrs.find({}, function(err, docs) {
		    if (err) throw err;
	        if (docs.length == 0) console.log('users do not exist: '+JSON.stringify(docs));
	        else console.log('users exist: '+JSON.stringify(docs));
		});
		*/
		var htmlSourceProfile = null;
		var venueTemplate = null;
		fs.readFile(path + "/app/models/venue.html","utf-8", function(err,data){
			if (err) throw err;
			venueTemplate = data;
			fs.readFile(path + "/public/profile.html", "utf-8", function (err,data) {
				if (err) throw err;
			  	htmlSourceProfile = data;
			  	jsdom.env({
					html: htmlSourceProfile,
					src: [jquerySource],
					done: function (err, window) {
						if (err) throw err;
						var $ = window.$;
						console.log("index page DOM successfully retrieved");
						//$('.venues').append(venueTemplate);
						var userVenues = "";
						Usrs.findOne({ _id: currentUserPass }, function(err, docs) {
						    if (err) throw err;
						    userVenues = docs.rsvp.venues;
							console.log('user RSVPs: '+JSON.stringify(userVenues));
							$('#profile-rsvps').html(userVenues.length);
							if (userVenues.length > 0){
								/*for (var i=0;i<userVenues.length;i++){
									$('.venues').append(venueTemplate);
					        		venueId = userVenues[i].id;
					        		venueName = userVenues[i].name;
					        		venueLink = userVenues[i].link;
					        		venueImgLink = userVenues[i].imglink;
					        		venueTip = userVenues[i].tip;
					        		$('#venue-image').last().attr('src',venueImgLink);
					        		$('#link-venue-image').last().attr('href',venueLink);
					        		$('#link-venue-heading').last().attr('href',venueLink);
									$('#link-venue-heading').last().html(venueName);
									$('.button-rsvp-undo').last().removeClass('hidden');
									$('#venue-tip').last().hmtl(venueTip);
					        	}*/
							}else{
								$('.venues').append('You are not planning to attend any venues yet.');
							}
							console.log("index page DOM manipulations complete");
							var newHtml = serializeDocument(window.document);
							res.send(newHtml);
							window.close();
						});
					}
				});
			});
		});
	});
	app.route(/rsvppost/).post(isLoggedIn, function(req, res){
		var venueId = req.body.venueid;
		var venueName = req.body.venuename;
		var venueLink = req.body.venuelink;
		var venueImgLink = req.body.venueimglink;
		var venueTip = req.body.venuetip;
		var dateLog = "";
			var date = new Date();
			var year = date.getFullYear();
			var month = date.getMonth()+1;
			if (month <10) month = "0"+month;
			var day = date.getDate();
			var hours = date.getHours();
			var minutes = date.getMinutes();
			if (minutes <10) minutes = "0"+minutes;
			dateLog = year+"-"+month+"-"+day+" "+hours+":"+minutes;
		/*
		* insert data in DB here
		*/
    	var id = null;
    	req.session.valid = true;
  		res.redirect('/profile');
	});
	app.route(/rsvpdelete/).post(isLoggedIn, function(req, res){
		var currentUserId = req.session.passport.user;
    	var venueId = req.body.venueid;
    	console.log('venueId: '+venueId);
	});
	app.route('/api/:id').get(isLoggedIn, function(req, res){
		res.json(req.user.github);
	});
	app.route('/auth/github').get(passport.authenticate('github'));
	app.route('/auth/github/callback').get(passport.authenticate('github', {
		successRedirect: '/',
		failureRedirect: '/login'
	}));
	app.route('/api/:id/clicks')
		.get(isLoggedIn, clickHandler.getClicks)
		.post(isLoggedIn, clickHandler.addClick)
		.delete(isLoggedIn, clickHandler.resetClicks);
	var apiUrlRemote = 'https://api.foursquare.com/v2/venues/explore?client_id='+process.env.FOURSQUARE_KEY+'&client_secret='+process.env.FOURSQUARE_SECRET+'&v=20130815&query=nightclub&near=';
	app.route('/api/clicks/venues').get(function(req, res){
		var locationName = req.url.substring(req.url.indexOf('=')+1,req.url.length);
		console.log('request url: '+locationName);
		res.json({"explore":locationName});
	});
};
