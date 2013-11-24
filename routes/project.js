/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-23
 * 
 * Liest die Project-Konfiguration ein.
 * Mit der middleware *selectProject* kann
 * wird die variable res.locals.project bereit 
 * gestellt.
 */


var config;
var pathExtra = require('path-extra');
var fs = require('fs');

var project_configuration = {};
var fs = require('fs');
var startDirectory = __dirname;
var added_projects_listeners =[];

var addAddedListener = function(callback){
	added_projects_listeners.push(callback);
}

var notifyListeners = function(project){
	for( var i  in added_projects_listeners){
		try{
			added_projects_listeners[i](project);
		}catch(e){
		}
	}
}

var saveProjectConfig = function(project){
	if (typeof config.project_file!='undefined'){
		try{
			var file = config.project_file;
			if (file.substring(0,1)=='~'){
				file = file.replace('~',pathExtra.homedir());
			}else if(file.substring(0,1)=='/'){
				// do nothing, absolut path is set
			}else{
				file = startDirectory + '/' + file
			}
			fs.writeFileSync(file,JSON.stringify(project,"","\t"));
			project_configuration = project;
		}catch(e){
			throw new Error("error with the project file *"+config.project_file+"* \n "+e.message);
		}
	}
}

var loadProjectConfig = function(){
	if (typeof config.project_file!='undefined'){
		try{
			
			var file = config.project_file;
			if (file.substring(0,1)=='~'){
				file = file.replace('~',pathExtra.homedir());
			}else if(file.substring(0,1)=='/'){
				// do nothing, absolut path is set
			}else{
				file = startDirectory + '/' + file
			}
			
			
			
			
			if (fs.existsSync(file)===true){
				project_configuration = JSON.parse(fs.readFileSync(file, 'utf8'));
			}else{
				project_configuration = [];
			}
		}catch(e){
			throw new Error("error with the project file *"+config.project_file+"* \n "+e.message);
		}
	}
}

var selectProject = function(req, res, next){
	var p = req.url.split('/');
	var requested_project = p[1];
	if (typeof requested_project!=='undefined'){
		for(var i in project_configuration){
			if (requested_project==project_configuration[i].name){
				res.locals.project = project_configuration[i];
				break;
			}
		}
	}
	next();
}

var getProjects = function(){
	return project_configuration;
}

var list = function(req, res, next)  {
	var projects = getProjects();
	var output = [];
	//console.log(req);
	if (req.query.node==''){
		var groupHash = {};
		for(var i in projects){
			if (typeof projects[i].group!='undefined'){
				if (typeof groupHash[projects[i].group]=='undefined'){
					groupHash[projects[i].group]=output.length;
					var entry = {
						id: 'grp-'+projects[i].group,
						text: projects[i].group,
						type: 'group',
						expanded: true
					};
					output.push(entry);
				}else{
					/*
				output[groupHash[projects[i].group]]['children'].push({
					id: projects[i].name,
					text: projects[i].title,
					type: projects[i].type?projects[i].type:'unkown',
					leaf: true
				})
				*/
				}
			}else{
				var entry = {
					id: projects[i].name,
					text: projects[i].title,
					type: projects[i].type?projects[i].type:'unkown',
					leaf: true
				}
				output.push(entry);
			}
		}
	}else{
		for(var i in projects){
			if ('grp-'+projects[i].group==req.query.node){
				var entry = {
					id: projects[i].name,
					text: projects[i].title,
					type: projects[i].type?projects[i].type:'unkown',
					leaf: true
				}
				output.push(entry);
			}
		}
	}
	res.json(200,output);
}

// not implemented yet
// checks if a path is found, and writable
var pathfound = function(req, res, next)  {
	var projects = getProjects();
	var output = {
		success: false
	};
	fs.exists(req.body.path, function (exists) {
		output.success = exists;
		if (exists){
			
		}
		res.json(200,output);
	});
}

var form = function(req, res, next)  {
	var projects = getProjects();
	var output = {
		success: false
	};
	if (typeof req.body.name!=='undefined'){
		var name = req.body.name;
		output = {
			success: true
		};
		var foundIndex = -1;
		for(var i in projects){
			if (projects[i].name===name){
				output = {
					data:{
						name: projects[i].name,
						title: projects[i].title,
						basepath: projects[i].basePath,
						group: (projects[i].group)?projects[i].group:''
					},
					success: true
				};
				if (typeof projects[i].process!=='undefined'){
					output.data.cmd = projects[i].process.cmd;
					output.data.arg = projects[i].process.params.join(' ');
				}
				foundIndex=i;
			}
		}
		
		// save the form
		if (typeof req.body.title!=='undefined'){
			// append tailing slash if it's not set
			if (req.body.basepath.substring(req.body.basepath.length-1)!='/'){
				req.body.basepath+='/';
			}
			var item = {
				name: req.body.name,
				title: req.body.title,
				basePath: req.body.basepath,
				group: req.body.group
			}
			
			// create directory if it does not exists
			fs.exists(item.basePath, function (exists) {
				if (!exists){
					
					fs.mkdir(item.basePath,0777, function(){
					
					})
				}
			})
			
			
			if (req.body.cmd!=''){
				item.process = {
					cmd: req.body.cmd
				}
				if (req.body.arg!=""){
					item.process.params = req.body.arg.split(' ');
				}else{
					item.process.params = [];
				}
			}
			if (foundIndex!=-1){
				projects[foundIndex] = item;
			}else{
				notifyListeners(item);
				projects.push(item);
			}
			saveProjectConfig(projects);
		}
	}
	res.json(200,output);
}


var info = function(req, res, next)  {
	var projects = getProjects();
	var output = {
		success: false
	};
	if (typeof req.body.id!=='undefined'){
		var name = req.body.id;
		var foundIndex = -1;
		for(var i in projects){
			if (projects[i].name===name){
				output = projects[i];
				output.success = true;
				foundIndex=i;
			}
		}
	}
	res.json(200,output);
}


exports.getProjects = getProjects;
exports.selectProject = selectProject;
exports.addAddedListener = addAddedListener;

exports.initRoute=function(app){
	startDirectory = app.startDirectory;
	config = app.configFile;
	
	app.use(selectProject);
	app.get("/projects/list",list);
	app.post("/projects/form",form);
	app.post("/projects/info",info);
	app.post("/projects/pathfound",pathfound);
	loadProjectConfig();
	
	app.set('projects', this);
}
