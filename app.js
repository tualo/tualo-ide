/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-12
 * Last Changes: 2013-04-16
 *  
 */ 

var routes = ['project','sign','ui','file','syntax','process','git'];

var express = require('express');
var config;
var http = require('http');
var path = require('path');
var fs = require('fs');
var loggerLib = new require('./lib/logger');
var logger = new loggerLib();

var app;

function initServer(){
	app = express();
	app.configFile = config;
	app.configure(function(){
		app.set('port', config.port);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.bodyParser());
		app.use(express.cookieParser());
		app.use(express.session({ secret: config.session_secret}));
		app.use(express.static(path.join(__dirname, 'public')));
		
		
		
	});
	
	
	
	var server = http.createServer(app);
	server.listen(app.get('port'), function(){
		console.log("tualo - IDE - Server listening on port " + app.get('port'));
	});
	
	app.server = server; // bring the baseDir to the project-route
	app.startDirectory = __dirname; // bring the baseDir to the project-route
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