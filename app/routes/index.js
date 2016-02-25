'use strict';

var path = process.cwd();
var ClickHandler = require(path + '/app/controllers/clickHandler.server.js');
var clickHandler = new ClickHandler();

var Usrs = require('../models/users.js');
var Stocks = require('../models/stocks.js');

var https = require("https");
var http = require("http");

module.exports = function (app, passport, jsdom, fs) {
	
	var jquerySource = fs.readFileSync(path + "/public/js/jquery.min.js", "utf-8");
	var serializeDocument = jsdom.serializeDocument;

	function isLoggedIn(req, res, next){
		if (req.isAuthenticated()) return next();
		else {
			if (req.url.indexOf('profile') != -1){
				res.redirect('/login');
			}else{
				console.log(req.url.substring(req.url.indexOf('?'),req.url.length));
				res.redirect('/login'+req.url.substring(req.url.indexOf('?'),req.url.length));
			}
		}
	}
	function isLoggedInBool(req, res, next){
		if (req.isAuthenticated()) return true;
		else return false;
	}

	function getStockData(stock, template,req,res,ws){
		var markitondemandURLwithParam = "http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters={%22Normalized%22%3Afalse%2C%22NumberOfDays%22%3A365%2C%22DataPeriod%22%3A%22Day%22%2C%22Elements%22%3A[{%22Symbol%22%3A%22"+stock+"%22%2C%22Type%22%3A%22price%22%2C%22Params%22%3A[%22c%22]}]}";
		http.get(markitondemandURLwithParam, (response) => {
			response.setEncoding('utf-8');
			var body = "";
		  	response.on('data', (chunk) => {body += chunk;});
		  	response.on('end', () => {
				var json = JSON.parse(body);
				if (typeof json.Elements[0] != 'undefined'){
					if (template != "") callbackJSDOM(json,template,req,res);
					else callbackWS(json,req,ws);
				}else{
					callbackError(req,ws);
				}
		  	});
		}).on('error', (e) => {
		  	console.log(`Got error: ${e.message}`);
		}).on('close', () => {
			console.log('connection closed');
		});
	}
	function callbackJSDOM(data,template,req,res){
		console.log('template: '+template);
		console.log('callback: '+JSON.stringify(data));
		var chartData = data;
		var htmlNavAuthed = "<li class='nav-pills active'><a href='#app'><span class='glyphicon glyphicon-stats'></span> Stocks</a></li><li class='nav-pills'><a href='/profile'><span class='glyphicon glyphicon-user'></span> My Profile</a></li><li class='nav-pills'><a href='/logout'><span class='glyphicon glyphicon-remove'></span> Logout</a></li>";
		var htmlNavNotAuthed = "<li class='nav-pills active'><a href='#app'><span class='glyphicon glyphicon-stats'></span> Stocks</a></li><li class='nav-pills'><a id='login-href' href='/login'><span class='glyphicon glyphicon-user'></span> Login with Github</a></li>";
		fs.readFile(path + "/public/"+template, "utf-8", function (err,data) {
			if (err) throw err;
		  	var htmlSourceIndex = data;
		  	jsdom.env({
				html: htmlSourceIndex,
				src: [jquerySource],
				done: function (err, window) {
					if (err) throw err;
					var $ = window.$;
					console.log("index page DOM successfully retrieved");
					if (isLoggedInBool(req, res)) $('.navbar-right').html(htmlNavAuthed);
					else $('.navbar-right').html(htmlNavNotAuthed);
					$('.instructions').append('To be able to add stocks using suggestions you have to allow mixed content in your browser, because dev.markitondemand.com/MODApis/Api/v2/ is availalbe by http protocol only.');
					var stockName = chartData.Elements[0].Symbol;
			    	var chartDates = chartData.Dates;
			    	var chartValues = chartData.Elements[0].DataSeries.close.values;
			    	var chartDataFiltered = [];
					chartDates.forEach(function(curVal, index, array){
			    		var unit = [new Date(curVal).getTime(),chartValues[index]];
			    		chartDataFiltered.push(unit);
			    	});
			    	var chartDataFinalObject = [{"stock":stockName,"data":chartDataFiltered}];
					Stocks.find({}, function(err, docs) {
					    if (err) throw err;
					    if (docs.length == 0) {
				        	console.log('stocks do not exist: '+JSON.stringify(docs));
				        	console.log('inserting stock data');
				        	var newStock = new Stocks();
							newStock._id = stockName;
							newStock.data = chartDataFinalObject;
							newStock.save(function (err) {
								if (err) throw err;
								console.log('new data saved');
							});
							console.log('newStock: '+JSON.stringify(newStock));
				        }else{
				        	console.log('stocks exist: '+JSON.stringify(docs));
				        	var dbChartData = [];
				        	docs.forEach(function(element, index, array){
				        		dbChartData.push(element.data[0]);
				        	});
				        	$('.chart-data').append(JSON.stringify(dbChartData));
				        }
						console.log("index page DOM manipulations complete");
						var newHtml = serializeDocument(window.document);
						res.send(newHtml);
						window.close();
					});
				}
			});
		});
	}
	function callbackWS(data,req,ws){
		console.log('callback: '+JSON.stringify(data));
		var chartData = data;
		var stockName = chartData.Elements[0].Symbol;
    	var chartDates = chartData.Dates;
    	var chartValues = chartData.Elements[0].DataSeries.close.values;
    	var chartDataFiltered = [];
		chartDates.forEach(function(curVal, index, array){
    		var unit = [new Date(curVal).getTime(),chartValues[index]];
    		chartDataFiltered.push(unit);
    	});
    	var chartDataFinalObject = [{"stock":stockName,"data":chartDataFiltered}];
    	Stocks.find({}, function(err, docs) {
		    if (err) throw err;
		    var newStock = null;
		    if (docs.length == 0) {
	        	console.log('stocks do not exist: '+JSON.stringify(docs));
	        	console.log('inserting stock data');
	        	newStock = new Stocks();
				newStock._id = stockName;
				newStock.data = chartDataFinalObject;
				newStock.save(function (err) {
					if (err) throw err;
					console.log('new data saved');
				});
				console.log('newStock: '+JSON.stringify(newStock));
	        }else{
	        	console.log('stocks exist: '+JSON.stringify(docs));
	        	console.log('checking if stock already exists in DB');
	        	var dbContainsStock = false;
	        	docs.forEach(function(element, index, array){
	        		if (element.data[0].stock === stockName) dbContainsStock = true;
	        	});
	        	console.log('dbContainsStock: '+dbContainsStock);
	        	if (!dbContainsStock){
	        		console.log('inserting stock data');
	        		newStock = new Stocks();
					newStock._id = stockName;
					newStock.data = chartDataFinalObject;
					newStock.save(function (err) {
						if (err) throw err;
						console.log('new data saved');
					});
					console.log('newStock: '+JSON.stringify(newStock));
	        	}
	        }
	        Stocks.find({}, function(err, docs) {
		    	if (err) throw err;
		        var dbChartData = [];
	        	docs.forEach(function(element, index, array){
	        		dbChartData.push(element.data[0]);
	        	});
		        ws.send(JSON.stringify(dbChartData),function(error) {
				    if (error) throw error;
				});
	        });
		});
	}
	function callbackError(req,ws){
        ws.send('no data',function(error) {
		    if (error) throw error;
		});
	}

	app.ws('/addstock', function(ws, req) {
		console.log('/addstock');
	  	ws.on('message', function(msg) {
	  		msg = msg.substring(0,msg.indexOf("-")-1);
	  		console.log('stock code: '+msg);
	  		getStockData(msg, "",null,req,ws);
	  	});
	  	ws.on('close', function() {
	        console.log('Add Stock: Client disconnected.');
	    });
	    ws.on('error', function() {
	        console.log('Add stock: ERROR');
	    });
	});
	app.ws('/removestock', function(ws, res){
		console.log('/removestock');
		ws.on('message', function(msg){
			console.log('stock code: '+msg);
			Stocks.remove({ _id: msg }, function(err,data){
				if (err) throw err;
				console.log(data);
				Stocks.find({}, function(err, docs) {
			    	if (err) throw err;
			        var dbChartData = [];
		        	docs.forEach(function(element, index, array){
		        		dbChartData.push(element.data[0]);
		        	});
			        ws.send(JSON.stringify(dbChartData),function(error) {
				    	if (error) throw error;
					});
		        });
			});
		});
		ws.on('close', function() {
	        console.log('Remove stock: Client disconnected.');
	    });
	    ws.on('error', function() {
	        console.log('Remove stock: ERROR');
	    });
	});
	
	app.ws('/', function (ws,res) {
		console.log('websocket opened on route /');
		var dbChartData = [];
		setInterval(function () {
			Stocks.find({}, function(err, docs) {
		    	if (err) throw err;
		        var dbChartDataUpdate = [];
	        	docs.forEach(function(element, index, array){
	        		dbChartDataUpdate.push(element.data[0]);
	        	});
	        	if (dbChartData.length == 0){
	        		dbChartData = dbChartDataUpdate;
	        		console.log('dbChartData init: '+JSON.stringify(dbChartData));
	        	}
	        	if (dbChartData.length != dbChartDataUpdate.length){
	        		console.log('stocks data changed');
	        		dbChartData = dbChartDataUpdate;
	        		ws.send(JSON.stringify(dbChartData),function(error) {
	        			if (error) throw error;
					});
	        	}else{
	        		console.log('stock data not changed');
	        	}
	        });
		}, 3000);
		ws.on('close', function() {
	        console.log('Persistent websocket: Client disconnected.');
	        ws._socket.setKeepAlive(true);
	    });
	    ws.on('error', function() {
	        console.log('Persistent websocket: ERROR');
	    });
	});
	
	app.route('/').get(function (req, res) {
		Usrs.find({}, function(err, docs) {
		    if (err) throw err;
	        if (docs.length == 0) console.log('users do not exist: '+JSON.stringify(docs));
	        else console.log('users exist: '+JSON.stringify(docs));
		});
		getStockData("AAPL", "index.html", req, res);
	});
	
	app.route('/login').get(function (req, res) {
		res.sendFile(path + '/public/login.html');
	});
	app.route('/logout').get(function (req, res) {
		req.logout();
		res.redirect('/login');
	});
	app.route('/profile').get(isLoggedIn, function (req, res) {
		var currentUserPass = req.session.passport.user;
		var htmlSourceProfile = null;
		fs.readFile(path + "/public/profile.html", "utf-8", function (err,data) {
			if (err) throw err;
		  	htmlSourceProfile = data;
			Usrs.findOne({ _id: currentUserPass }, function(err, docs) {
			    if (err) throw err;
			    var userStocks = docs.stocks.data;
				jsdom.env({
					html: htmlSourceProfile,
					src: [jquerySource],
					done: function (err, window) {
						if (err) throw err;
						var $ = window.$;
						console.log("index page DOM successfully retrieved");
						$('.instructions').append('Private stocks data could have been here, but it is not a matter of the task.');
						$('#profile-stocks').html(userStocks.length);
						console.log("index page DOM manipulations complete");
						var newHtml = serializeDocument(window.document);
						res.send(newHtml);
						window.close();
					}
				});
			});
		});
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
};