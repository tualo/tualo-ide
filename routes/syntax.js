/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-22
 *
 * Description (DE):
 * Die Syntax-Checking-Route ist über <project>/syntax/check erreichbar. 
 * Es wird die Übergebene Datei (Post-Parameter: content auf die 
 * korrekte Syntax geprüft. Dabei wird das Dateiformat über die 
 * Endung im Post-Parameter file für die Ermittelung der Programmiersprache 
 * verwendet.
 * Es wir immer ein JSON-String zurück gegeben.
 * {
 *   msg: "" // Die Nachricht zur Meldung
 *   success: true // Falsch wenn die Syntax Fehler enthält.
 *   line: 1 // Optional (Nur wenn ein Fehler existsiert) Die Zeilennummer des Fehlers
 *   col: 5 //  Optional (Nur wenn ein Fehler existsiert) Das Zeichen des Zehlers in der Zeile
 * }
 */


var os = require('os');
var fs = require('fs');
var file = require('./file');

var UglifyJS = require("uglify-js");
var child_process = require('child_process');

/**
* uses uglify js beautify function
*/
var beautify = function(req, res, next){
	
	var fileID = req.body.file;
	if (fileID.substr(0,1)=='/'){
		fileID = fileID.substr(1);
	}
	var fileParts = fileID.split('/');
	var lastPart = fileParts[fileParts.length-1];
	var data = req.body.content;
	var fileType = file.getType(fileID);
	switch(fileType){
		case "javascript":
			try{
				var cleanOutput = (UglifyJS.minify(data,{
					compress: false,
					fromString: true,
					warnings: true,
					output: { beautify: true }
				}));
				res.json(200,{
					success: true,
					data: cleanOutput,
					id: fileID
				});
			}catch(e){
				res.json(200,{
					success: false,
					msg: e.message,
					id: fileID
				});
			}
			break;
		default:
			res.json(200,{
				success: false,
				msg: "Not supported for this filetype"
			});
			break;
	}
}

var check = function(req, res, next) {
	var fileID = req.body.file;
	if (fileID.substr(0,1)=='/'){
		fileID = fileID.substr(1);
	}
	
	var fileParts = fileID.split('/');
	var lastPart = fileParts[fileParts.length-1];
	
	var data = req.body.content;
	var fileType = file.getType(fileID);
	switch(fileType){
		case "javascript":
			try{
				var toplevel = UglifyJS.parse(data, {
					filename: res.locals.project.basePath+fileID,
					toplevel: null
				});
				res.json(200,{
					success: true,
					msg: "",
					id: req.body.file
				});
			}catch(e){
				res.json(200,{
					success: false,
					msg: e.message,
					line: e.line-1,
					col: e.col,
					id: req.body.file
				});
			}
			break;
		case "php":
			
			var temp_dir = os.tmpDir();
			fs.writeFile(temp_dir+'ide-test.php', data);
			var command = 'php -l '+temp_dir+'ide-test.php';
			
			child_process.exec(command,{
				timeout: 30000
			},function(err,stdout,stderr){
				fs.unlink(temp_dir+'ide-test.php');
				if (err){
					var out = stdout.split("\n");
					var pos = {line: 1,col: 1,msg: stdout}
					for (var i in out){
						
						var parts = out[i].split(' on line ');
						
						if (parts.length==2){
							res.json(200,{
								success: false,
								msg: parts[0].replace(' in '+temp_dir+'ide-test.php',''),
								id: req.body.file,
								line: parts[1]*1 - 1,
								col: 1
							});
							return;
						}
					}
					res.json(200,{
						success: false,
						msg: pos.msg,
						id: req.body.file,
						line: pos.line,
						col: pos.col
					});
					return;
				}
				if (stdout.indexOf("No syntax errors detected")>=0){
					res.json(200,{
						success: true,
						msg: "",
						id: req.body.file
					});
				}else{
					res.json(200,{
						success: false,
						msg: err.message,
						id: req.body.file,
						line: 1,
						col: 1
					});
				}
			});
			
			break;
		default:
			res.json(200,{
				success: true,
				msg: "",
				id: req.body.file
			});
			break;
	}
}

exports.initRoute=function(app){
	app.post("/:project/syntax/check",check);
	app.post("/:project/syntax/beautify",beautify);
}