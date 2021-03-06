/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-22
 *
 * Description (DE):
 * 
 * Die GIT Route.
 */

var child_process = require('child_process');
var path = require('path');
var fs = require('fs');



var ignore = function(req, res, next) {

    var fileID = req.body.file;
    fs.readFile(path.join(res.locals.project.basePath,'.gitignore'), function (err, data) {
        if (err){
            res.json(200,{
                success: false,
                msg: err.message
            });
            return;
        }
        data+="\n";
        data+=fileID;
        fs.writeFile(path.join(res.locals.project.basePath,'.gitignore'), data, [], function (err) {
            if (err){
                res.json(200,{
                    success: false,
                    msg: err.message
                });
                return;
            }
            res.json(200,{
                success: true,
                file: req.body.file
            });
        });
    });

}

var push = function(req, res, next) {
    //var fileID = req.body.file.substring(1);
    var command = 'git push';
    child_process.exec(command,{
        timeout: 30000,
        cwd: res.locals.project.basePath
    },function(err,stdout,stderr){
        res.json(200,{
            success: true,
            file: req.body.file
        });
    })
}


var pushtags = function(req, res, next) {
    //var fileID = req.body.file.substring(1);
    var command = 'git push --tags';
    child_process.exec(command,{
        timeout: 30000,
        cwd: res.locals.project.basePath
    },function(err,stdout,stderr){
        res.json(200,{
            success: true,
            file: req.body.file,
            out: stdout
        });
    })
}



var add = function(req, res, next) {
    var fileID = req.body.file;

    var command = 'git add .'+fileID;
    child_process.exec(command,{
        timeout: 30000,
        cwd: res.locals.project.basePath
    },function(err,stdout,stderr){
        res.json(200,{
            success: true,
            file: req.body.file
        });
    })
}

var reset = function(req, res, next) {
    var fileID = req.body.file;

    var command = 'git reset HEAD .'+fileID;
    child_process.exec(command,{
        timeout: 30000,
        cwd: res.locals.project.basePath
    },function(err,stdout,stderr){
        res.json(200,{
            success: true,
            file: req.body.file,
            command: command,
            stdout: stdout,
            stderr: stderr
        });
    })
}





var rm = function(req, res, next) {
    var fileID = req.body.file;

    var fileList = fileID.split(' ');
    var files = '';
    for(var i in fileList){
        if (files!=''){
            files+=' ';
        }
        files += '.'+fileList[i]; 
    }
    var command = 'git rm '+files;
    child_process.exec(command,{
        timeout: 30000,
        cwd: res.locals.project.basePath
    },function(err,stdout,stderr){
        res.json(200,{
            success: true,
            file: req.body.file
        });
    })
}



var commit = function(req, res, next) {
    var fileID = req.body.file;

    var fileList = fileID.replace(/\-\>/g,'').split(' ');
    var leading_slash = /^\//;
    var files = '';
    for(var i in fileList){
        if (files!==''){
            files+=' ';
        }
        if (fileList[i]!==''){
            if (!leading_slash.test(fileList[i])){
                fileList[i]=path.sep+fileList[i];
            }
            files += '.'+fileList[i]; 
        }
    }

    var message = req.body.message.replace(/\n/gm,' ').replace(/"/g,'*');
    var command = 'git commit -m "'+message+'" '+files;
    child_process.exec(command,{
        timeout: 30000,
        cwd: res.locals.project.basePath
    },function(err,stdout,stderr){
        res.json(200,{
            success: true,
            file: req.body.file,
            fileList: fileList,
            command: command,
            err: err,
            stdout: stdout.toString(),
            stderr: stderr.toString()
        });
    })
}

var tag = function(req, res, next) {
    var fileID = req.body.file.substring(1);
    var tag = req.body.tag.replace(/\n/gm,' ').replace(/"/g,'*').replace(/\s/g,'-');
    var message = req.body.message.replace(/\n/gm,' ').replace(/"/g,'*');
    var command = 'git tag -a '+tag+' -m "'+message+'"';
    console.log(command);
    child_process.exec(command,{
        timeout: 30000,
        cwd: res.locals.project.basePath
    },function(err,stdout,stderr){
        res.json(200,{
            success: true,
            file: req.body.file
        });
    })
}


var status = function(req, res, next) {
    var fileID = req.body.file.substring(1);
    var command = 'git status';
    _status(res.locals.project.basePath,fileID,function(err,gitStatus){
        res.json(200,{
            success: true,
            status: gitStatus
        });
    });
}


var _ignored = function(pathName,cb){
    fs.readFile(path.join(pathName,'.gitignore'), function (err, data) {
        if (err){
            cb(err,null);
        }
        var f = (data+'').split("\n");
        if (f[f.length-1]===''){
            f.pop(); // remov last empty line
        }
        cb(null,f);
    });
}
var _status = function(pathName,fileID,cb) {
    var command = 'git status';
    child_process.exec(command,{
        timeout: 30000,
        cwd: path.join(pathName,fileID)
    },function(err,stdout,stderr){
        var p = parse(stdout);
        _ignored(pathName,function(err,ignored){
            p.ignored=[];
            for(var i in ignored){
                p.ignored.push({
                    state: 'ignored',
                    file: ignored[i]
                })
            }
            cb(err,p);
        })

    });
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
                        result.untracked.push({
                            state: 'untracked',
                            file: fileState
                        });
                        break;
                }
            }
        }
    }
    return result;
}

var initializeSocketIO = function(socket,app){
    socket.on('gitstatus', function (data) {
        console.log(data);
    });
}
exports.initializeSocketIO = initializeSocketIO;
exports.status = _status;
exports.initRoute=function(app){
    app.post("/:project/git/status",status);
    app.post("/:project/git/ignore",ignore);
    app.post("/:project/git/add",add);
    app.post("/:project/git/rm",rm);
    app.post("/:project/git/commit",commit);
    app.post("/:project/git/reset",reset);
    app.post("/:project/git/push",push);
    app.post("/:project/git/pushtags",pushtags);
    app.post("/:project/git/tag",tag);
}