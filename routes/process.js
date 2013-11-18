/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-22
 */
var file = require('./file');
var process = require('child_process');

var running_processes = {};
var process_restart = {};
var io = null;


var startProcess= function(project,data,socket){
	var running_process = running_processes[project.name];
	
	 
	if (running_process != null){
		process_restart[project.name]=true;
		running_process.kill();
		console.log('process killed');
		socket.emit('process killed')
	} else {
		
		running_process = process.spawn( project.process.cmd, project.process.params,{ 
			cwd: project.basePath,
			env: process.env
		});
		 
		running_process.stdout.on('data',function(data){
			onProcessData(socket,data);
		});
		
		running_process.stderr.on('data',function(data){
			onProcessErrorData(socket,data);
		});
		running_process.on('message',function(data){
			onProcessMessage(socket,data);
		});
		running_processes[project.name] = running_process;
		
		running_process.on('close',function(project){
			// onProcessClose needs the project object for
			// restarting a kill process
			// if process_restart is true
			return function(code, signal){
				onProcessClose(project,code, signal);
			}
		}(project));
		
		running_process.on('exit',onProcessExit);
		console.log('process_started');
		
	}
}

var stopProcess= function(project,data,socket){
	//console.log(project);
	var running_process = running_processes[project.name];
	
	if (running_process != null){
		process_restart[project.name]=true;
		running_process.kill();
		socket.emit('process killed');
		delete running_processes[project.name];
		//console.log('process killed');
	}
}



var onProcessData = function (socket,data) {
  socket.emit('std',data.toString());
};

var onProcessErrorData = function (socket,data) {
  socket.emit('err',data.toString());
};

var onProcessDisconnect = function (){
	//console.log('onProcessDisconnect');
	//running_process = null;
}

var onProcessMessage = function (socket,message, sendHandle){
	//console.log('onProcessMessage: '+message);
	//socket.emit('message',message);
	//running_process = null;
}

var onProcessClose = function (project,code, signal){
	console.log('onProcessClose: '+code);
	/*
	running_process = null;
	if (process_restart===true){
		process_restart=false; // to prevend an endless loop 
		startProcess(project);
	}
	*/
}

var onProcessExit = function (code, signal){
	console.log('onProcessExit: '+code);
	//running_process = null;
}


var onProcessError = function (err){
	console.log('onProcessError: '+err);
	//running_process = null;
}

var initSocketForProject= function(project){
	var chat = io.of('/'+project.name+'/process').on('connection', function (socket) {
		socket.on('start process',function(data){
			startProcess(project,data,socket);
		});
		
		socket.on('stop process',function(data){
			stopProcess(project,data,socket);
		});
		
		socket.on('disconnect', function () {
			stopProcess(project,null,socket);
		});
	});
}

exports.initRoute=function(app){
	io = require('socket.io').listen(app.server);
	io.set('log level',1); // show only warnings
	//var projects = project.getProjects();
	for(var i in app.projects){
		initSocketForProject(projects[i]);
	}
}