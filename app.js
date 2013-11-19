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
	var cookieParser = express.cookieParser();
	var sessionStore = express.session({ secret: config.session_secret});
	app = express();
	app.configFile = config;
	app.configure(function(){
		app.set('port', config.port);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.json());
		app.use(express.urlencoded());
		app.use(cookieParser);
		app.use(sessionStore);
		app.use(express.static(path.join(__dirname, 'public')));
		
		
		
	});
	app.set('startDirectory',__dirname); // make the baseDir accessible the project-route(s)
	
	
	
	var server = http.createServer(app);
	
	io = require('socket.io').listen(server);
	
	io.set('log level',3); // show only warnings
	var sessionSockets = new SessionSockets(io, sessionStore, cookieParser);
	app.set('io',io);
	app.set('sessionIO',sessionSockets);
	
	
	for(var i in routes){
		require('./routes/'+routes[i]).initRoute(app);
	}
	
	server.listen(app.get('port'), function(){
		console.log("tualo - IDE - Server listening on port " + app.get('port'));
	});

	
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