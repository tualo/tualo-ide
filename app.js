/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-12
 * Last Changes: 2013-04-16
 *  
 */ 
var express = require('express');
var socketIO = require('socket.io');
var SessionSockets = require('session.socket.io');


var routes = ['project','sign','ui','file','syntax','process','git'];


var config;
var http = require('http');
var path = require('path');
var fs = require('fs');
var loggerLib = new require('./lib/logger');
var logger = new loggerLib();

var app;
var io;

function initServer(){
	var cookieParser = express.cookieParser(config.session_secret);
	var sessionStore = express.session({ secret: config.session_secret});
	app = express();
	app.configFile = config;
	app.configure(function(){
		app.set('port', config.port);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.bodyParser());
		app.use(cookieParser);
		app.use(sessionStore);
		app.use(express.static(path.join(__dirname, 'public')));
		
		
		
	});
	
	
	
	var server = http.createServer(app);
	server.listen(app.get('port'), function(){
		console.log("tualo - IDE - Server listening on port " + app.get('port'));
	});

	var sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
	io = socketIO.listen(app.server);
	io.set('log level',1); // show only warnings
	
	app.set('io',io);
	app.set('sessionIO',sessionSockets);
	
	app.set('startDirectory',__dirname); // make the baseDir accessible the project-route(s)
	for(var i in routes){
		require('./routes/'+routes[i]).initRoute(app);
	}
}

function findConfiguration(){
	fs.exists(path.join('/etc','tualo-ide','config.json'),function(exists){
		if (exists){
			try{
				config = require(path.join('/etc','tualo-ide','config.json'));
				initServer();
			}catch(e){
				logger.log('error','The configuration is invalid *1. '+e.Error);
			}
		}else{
			fs.exists(path.join(__dirname,'config','config.json'),function(exists){
				if (exists){
					try{
						config = require(path.join(__dirname,'config','config.json'));
						initServer();
					}catch(e){
						logger.log('error','The configuration is invalid *2.'+e);
					}
				}else{
					logger.log('error','There is no configuration file.');
					process.exit();
				}
			});
		}
	});
}


function startup(){
	findConfiguration();
}

startup();