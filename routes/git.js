/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-22
 *
 * Description (DE):
 * 
 * Die GIT Route kann genutzt werden, um git-repos anzuzeigen
 */

var child_process = require('child_process');
var path = require('path');
var project = require('./project');



var ignore = function(req, res, next) {
	project.selectProject(req, res, next);
	var fileID = req.body.file.substring(1);
	res.json(200,{
		success: true
	});
}


var add = function(req, res, next) {
	project.selectProject(req, res, next);
	var fileID = req.body.file.substring(1);
	var command = 'git add '+fileID;
	console.log(path.join(res.locals.project.basePath,fileID));
	console.log(command);
	child_process.exec(command,{
		timeout: 30000,
		cwd: res.locals.project.basePath
	},function(err,stdout,stderr){
		res.json(200,{
			success: true,
			msg: stdout,
			p: parse(stdout)
		});
	})
}

var status = function(req, res, next) {
	project.selectProject(req, res, next);
	var fileID = req.body.file.substring(1);
	var command = 'git status';
	console.log(path.join(res.locals.project.basePath,fileID));
	child_process.exec(command,{
		timeout: 30000,
		cwd: path.join(res.locals.project.basePath,fileID)
	},function(err,stdout,stderr){
		res.json(200,{
			success: true,
			msg: stdout,
			p: parse(stdout)
		});
	})
}

var parse = function(str){
	var lines = str.split("\n");
	var result = {};
	result.staged = [];
	result.notstaged = [];
	result.untracked = [];
	var state='none';
	for(var i in lines){
		var line = lines[i];
		if (line.substring(0,1)==='#'){
			if (line.indexOf('On branch')>0){
				if (state=='none'){
					result.branch = line.replace('# On branch ','');
				}
			}
			if (line.indexOf('Changes not staged for commit:')>0){
				state='notstaged';
			}
			if (line.indexOf('Changes to be committed:')>0){
				state='staged';
			}
			if (line.indexOf('Untracked files:')>0){
				state='untracked';
			}
			var tabPos = line.indexOf("\t");
			if (tabPos!=-1){
				var fileState = line.substring(tabPos+1);
				switch(state){
					case 'staged':
						var parts = fileState.split(':   ');
						result.staged.push({
							state: parts[0],
							file: parts[1]
						});
						break;
					case 'notstaged':
						var parts = fileState.split(':   ');
						result.notstaged.push({
							state: parts[0],
							file: parts[1]
						});
						break;
					case 'untracked':
						result.untracked.push(fileState);
						break;
				}
			}
		}
	}
	return result;
}

exports.initRoute=function(app){
	app.post("/:project/git/status",status);
	app.post("/:project/git/ignore",ignore);
	app.post("/:project/git/add",add);
}