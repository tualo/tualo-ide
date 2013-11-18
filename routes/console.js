var file = require('./file');
var process = require('child_process');
var io;

var running_processes	=	{}; // keepin
var process_restart 	=	{};

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
}

var onProcessExit = function (code, signal){
	console.log('onProcessExit: '+code);
	//running_process = null;
}


var onProcessError = function (err){
	console.log('onProcessError: '+err);
}


var initSocketForProject= function(project){
	var chat = io.of('/'+project.name+'/console').on('connection', function (err,socket,session) {
		console.log(session);
		socket.on('input',function(data){
			startProcess(project,data,socket,session);
		});
		
		socket.on('open',function(data){
			startProcess(project,data,socket,session);
		});
		
		socket.on('close',function(data){
			stopProcess(project,data,socket,session);
		});
		
		socket.on('disconnect', function () {
			stopProcess(project,null,socket,session);
		});
		
	});
}


exports.initRoute=function(app){
	io = app.get('sessionIO');
	for(var i in app.projects){
		initSocketForProject(projects[i]);
	}
}