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
var https = require('https');
var path = require('path');
var fs = require('fs');
var loggerLib = new require('./lib/logger');
var logger = new loggerLib();

var app;
var io;

function initServer(){
	var cookieParser = express.cookieParser();
	var sessionStore = express.session({ secret: config.session_secret});
	
	var httpPort=8085;
	var httpsPort=8086;
	if ((typeof config.useHTTP=='undefined')&&(typeof config.useHTTPS=='undefined')){
		config.useHTTP = true;
		if (typeof config.port!='undefined'){
			httpPort = config.port;
		}
	}

	if (typeof config.useHTTPS=='undefined'){
		config.useHTTPS=false;
	}
	if (typeof config.useHTTP=='undefined'){
		config.useHTTP=false;
	}
	
	
	
	app = express();
	app.configFile = config;
	app.configure(function(){
		//app.set('port', port);
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.json());
		app.use(express.urlencoded());
		app.use(cookieParser);
		app.use(sessionStore);
		app.use(express.static(path.join(__dirname, 'public')));
		
		
		
	});
	app.set('startDirectory',__dirname); // make the baseDir accessible the project-route(s)
	
	if (config.useHTTPS){
		httpsPort = config.httpsport;
		var credentials = {};
		if (typeof config.privateKey!='undefined'){
			var privateKey  = fs.readFileSync(config.privateKey, 'utf8');
			credentials.key = privateKey;
		}
		if (typeof config.certificate!='undefined'){
			var certificate  = fs.readFileSync(config.certificate, 'utf8');
			credentials.cert = certificate;
		}
		if (typeof config.ca!='undefined'){
			var ca  = fs.readFileSync(config.ca, 'utf8');
			credentials.ca = ca;
		}
		//{key: privateKey, cert: certificate};
		var httpsServer = https.createServer(credentials, app);
	}
	
	if (config.useHTTP){
		var httpServer = http.createServer(app);
		io = require('socket.io').listen(httpServer);
	}
	io.set('log level',1); // show only warnings
	app.set('io',io);
	
	
	for(var i in routes){
		require('./routes/'+routes[i]).initRoute(app);
	}
	
	if (config.useHTTP){
		httpServer.listen(httpPort, function(){
			console.log("tualo - IDE - Server listening on port " + httpPort);
		});
	}
	if (config.useHTTPS){
		httpsServer.listen(httpsPort, function(){
			console.log("tualo - IDE - Server listening on port " + httpsPort);
		});
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