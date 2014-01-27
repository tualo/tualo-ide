/**
 * Created with tualo IDE.
 * Author: Thomas Hoffmann
 * Date: 2013-04-22
 */

var indexUI = function(req, res, next) {
    res.render('layout',{
        title: res.locals.project.title,
        project: req.params.project,
        projectConfig: res.locals.project
    });
}

var startUI = function(req, res, next) {
    res.render('layout',{
        title: 'tualo IDE'
    });
}

exports.initRoute=function(app){
    app.get("/",startUI);
    app.get("/:project",indexUI);
}

