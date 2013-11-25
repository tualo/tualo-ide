/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-22
 */


var fs = require('fs');
var path = require('path');
var git = require('./git');
var jsDiff = require('diff');

var open = function(req, res, next) {
	var fileID = req.body.file;
	var fileParts = fileID.split('/');
	var lastPart = fileParts[fileParts.length-1];
	fs.readFile(res.locals.project.basePath+fileID,{encoding:'utf8'},function(err,data){
		if (err){
			res.json(200,{
				success: false,
				msg: err.message
			});
			return;
		}
		var stats = fs.lstatSync(res.locals.project.basePath+'/'+fileID);
		var mode = getType(fileID);
		if (mode==null){
			if (data.toString().indexOf('#!/usr/bin/env node')===0){
				mode = 'javascript';
			}else{
				mode = 'default';
			}
			
		}
		res.json(200,{
			success: true,
			mtime: stats.mtime,
			msg: "",
			mode: mode,
			data: data.toString(),
			name: lastPart,
			id: fileID
		});
	});
}

var stat = function(req, res, next){
	var fileID = req.body.file;
	if (fileID.substr(0,1)=='/'){
		fileID = fileID.substr(1);
	}
	fs.exists(res.locals.project.basePath+fileID,function(exists){
		if (exists===true){
			var stats = fs.lstatSync(res.locals.project.basePath+'/'+fileID);
			res.json(200,{
				success: true,
				mtime: stats.mtime,
				file: req.body.file
			});
		}else{
			res.json(200,{
				success: false,
				file: req.body.file,
				msg: "The file does not exists"
			});
		}
	});
}

var diff = function(req, res, next){
	var fileID = req.body.file;
	if (fileID.substr(0,1)=='/'){
		fileID = fileID.substr(1);
	}
	fs.exists(res.locals.project.basePath+fileID,function(exists){
		if (exists===true){
			var fileParts = fileID.split('/');
			var lastPart = fileParts[fileParts.length-1];
			var new_content = req.body.content;
			fs.readFile(res.locals.project.basePath+fileID,{encoding:'utf8'},function(err,data){
				if (err){
					res.json(200,{
						success: false,
						msg: err.message
					});
					return;
				}
				var stats = fs.lstatSync(res.locals.project.basePath+'/'+fileID);
				res.json(200,{
					success: true,
					mtime: stats.mtime,
					msg: "",
					mode: getType(fileID),
					data: jsDiff.diffChars(data.toString(), new_content),
					name: lastPart
				});
			});
		}else{
			res.json(200,{
				success: false,
				msg: "The file does not exists"
			});
		}
	});
}

var save = function(req, res, next) {
	var fileID = req.body.file;
	if (fileID.substr(0,1)=='/'){
		fileID = fileID.substr(1);
	}
	var fileParts = fileID.split('/');
	var lastPart = fileParts[fileParts.length-1];
	var data = req.body.content;
	fs.writeFile(res.locals.project.basePath+fileID,data,{encoding:'utf8'},function(err,data){
		if (err){
			res.json(200,{
				success: false,
				msg: err
			});
			return;
		}
		return open(req, res, next);
	});
}

var del = function(req, res, next) {
	var fileID = req.body.file;
	if (fileID.substr(0,1)=='/'){
		fileID = fileID.substr(1);
	}
	
	
	fs.unlink(res.locals.project.basePath+fileID,function(err){
		if (err){
			res.json(200,{
				success: false,
				msg: err,
				id: res.locals.project.basePath+fileID
			});
			return;
		}
		res.json(200,{
			success: true,
			id: res.locals.project.basePath+fileID
		});
	});
	
	
}

var delFolder = function(req, res, next) {
	var fileID = req.body.folder;
	if (fileID.substr(0,1)=='/'){
		fileID = fileID.substr(1);
	}
	
	
	fs.rmdir(res.locals.project.basePath+fileID,function(err){
		if (err){
			res.json(200,{
				success: false,
				msg: err.message,
				folder: req.body.folder
			});
			return;
		}
		res.json(200,{
			success: true,
			folder: req.body.folder
		});
	});
	
	
}

var exec = require('child_process').exec;

var createFind = function() {
	return new findCmd();
};

var findCmd = function() {
	this.options = [];
	this.command = 'find';
};

findCmd.prototype.args = function(opt) {
	this.options.push(opt);
	return this;
}

findCmd.prototype.exec = function(callback) {
	var self = this;
	var args = this.options.join(' ');
	var child = exec(this.command + ' '+ args  + ' ', function(err, stdout, stderr) {
		child.kill('SIGHUP');
		callback(err, stdout, stderr);
	});
};


var find = function(req, res, next){
	if ((req.query)&&(req.query.query)){
		var start=(req.query.start)?req.query.start:0;
		var limit=(req.query.limit)?req.query.limit:25
		var findfile = createFind();
		findfile.args('-P')
		.args(res.locals.project.basePath)
		.args('-name')
		.args('"'+req.query.query+'"')
		.exec(function(err,out,_e){
			var lines = out.split("\n");
			var output = [];
			for(var i in lines){
				
				if (i>=start){
					if (output.length<limit){
						var item = {
							shortfilename: path.basename(lines[i]),
							longfilename: lines[i].substring(res.locals.project.basePath.length),
							type: getType(path.basename(lines[i]))
						}
						output.push(item);
					}
				}
				
			};
			
			res.json(200,{
				success: true,
				totalCount:lines.length,
				data: output
			});
		})
	}else{
		res.json(200,{
			success: true,
			totalCount: 0,
			data:[]
		});
	}
}

var add = function(req, res, next) {
	req.body.content="// Sample Text";
	var fileID = req.body.file;
	fs.exists(res.locals.project.basePath+fileID,function(exists){
		if (exists===true){
			res.json(200,{
				success: false,
				msg: "File Exists already"
			});
			return;
		}else{
			save(req, res, next);
		}
	});
}

var addFolder = function(req, res, next) {
	var fileID = req.body.folder;
	fs.exists(res.locals.project.basePath+fileID,function(exists){
		if (exists===true){
			res.json(200,{
				success: false,
				msg: "File/ Folder exists already",
				folder: res.locals.project.basePath+fileID
			});
			return;
		}else{
			fs.mkdir(res.locals.project.basePath+fileID,function(err){
				if (err){
					return res.json(200,{
						success: false,
						msg: err.message,
						folder: res.locals.project.basePath+fileID
					});
				}
				return res.json(200,{
					success: true,
					msg: "",
					folder: res.locals.project.basePath+fileID
				});
			});
		}
	});
}

var listGet = function(req, res, next)  {
	if (typeof req.query!=='undefined'){
		//console.log(1);
		if (typeof req.query.node!=='root'){
			req.body={};
			req.body.path=req.query.node;
			return list(req, res, next);
		}else{
			req.body={};
			req.body.path='';
			return list(req, res, next);
		}
	}
	
	next();
}
var getType = function(filename,callback){
	var type = null;
	var fileParts = filename.split('.');
	var lastPart = fileParts[fileParts.length-1];
	switch(lastPart){
		case 'js':
			type = 'javascript';
			break;
		case 'jade':
			type = 'jade';
			break;
		case 'ss':
		case 'php':
			type = 'php';
			break;
		case 'css':
			type = 'css';
			break;
		case 'xml':
		case 'xsl':
		case 'xslt':
			type = 'xml';
			break;
		case 'sass':
			type = 'sass';
			break;
		case 'rb':
			type = 'ruby';
			break;
		case 'pl':
			type = 'perl';
			break;
		case 'sh':
			type = 'shell';
		case 'svg':
			type = 'xml';
		case 'sql':
			type = 'sql';
		case 'vb':
			type = 'vb';
		case 'vbs':
			type = 'vbscript';
		case 'properties':
			type = 'properties';
		case 'c':
		case 'h':
		case 'cpp':
		case 'hpp':
		case 'c++':
		case 'cc':
		case 'h++':
			type = 'clike';
			break;
	}
	return type;
}

var inFileArray = function(gitStatusA,file,useIndexOf){
	for(var i in gitStatusA){
		if (useIndexOf===true){
			if (gitStatusA[i].file.indexOf(file)>-1){
				if ( (gitStatusA[i].file.length-gitStatusA[i].file.indexOf(file))==file.length ){
					return true;
				}
			}
		}else{
			if (gitStatusA[i].file==file){
				return true;
			}
		}
	}
	return false;
}
var list = function(req, res, next)  {
	var pathID = req.body.path;
	if (pathID==='root'){
		pathID='';
	}
	if (typeof res.locals.project!=='undefined'){
		git.status(res.locals.project.basePath,'',function(err,gitStatus){
			fs.readdir(res.locals.project.basePath+pathID,function(err,files){
				if (err){
					res.json(200,{
						success: false,
						path: res.locals.project.basePath+pathID,
						msg: err.message,
						data: err
					});
					return;
				}
				
				var output_folders = [];
				var output_files = [];
				var output = [];
				for(var i in files){
					
					if (files[i].substring(0,1)!='.'){ // don't show hidden files
						var stats = fs.lstatSync(res.locals.project.basePath+pathID+'/'+files[i]);
						//var strClass = 'unkownfile';
						var entry = {
							id: pathID+'/'+files[i],
							label: files[i],
							text: files[i],
							type: 'unkownfile',
							leaf: true
						}
						if (stats.isDirectory()) {
							entry.type = 'folder';
							entry.leaf =  false;
						}else{
							entry.type =getType(files[i]);
						}
						
						var _fname = path.join(pathID.substring(1),files[i]);
						entry.git_ignored = inFileArray(gitStatus.ignored,_fname,true);
						entry.git_staged = inFileArray(gitStatus.staged,_fname);
						entry.git_notstaged = inFileArray(gitStatus.notstaged,_fname);
						entry.git_untracked = inFileArray(gitStatus.untracked,_fname);
						//if (_fname.indexOf('save.php')>=0){
						//	console.log(gitStatus.notstaged);
						//}
						if (entry.type==='folder'){
							output_folders.push(entry);
						}else{
							output_files.push(entry);
						}
					}
				}
				for(var i in output_folders){
					output.push(output_folders[i]);
				}
				for(var i in output_files){
					output.push(output_files[i]);
				}
				//console.log(output);
				res.json(200,output);
			});
		});
	}else{
		res.json(200,{success:false,msg:'there is no cookie set'});
	}
}


exports.getType = getType;
exports.initRoute=function(app){
	// new style
	app.post("/:project/file/open",open);
	app.post("/:project/file/save",save);
	app.post("/:project/file/stat",stat);
	app.post("/:project/file/diff",diff);
	app.post("/:project/file/add",add);
	app.post("/:project/file/addFolder",addFolder);
	app.post("/:project/file/del",del);
	app.post("/:project/file/delFolder",delFolder);
	app.post("/:project/file/list",list);

	app.post("/:project/file/find",find);
	app.get("/:project/file/find",find);

	app.get("/:project/file/list",listGet);
}