Description
===========

tualo-ide is an development environment running in browsers.


Requirements
============

* [node.js](http://nodejs.org/) -- v0.8.0 or newer

Installation
============

	npm install tualo-ide -g

Configuration
=============

A sample configuration file can be found in config in the module directory. 
At the startup tualo-ide searches for a configuration file. This is the search order:

* /etc/tualo-ide/config.json
* [module-directory]/config/config.json

The configuration is a JSON-File. The following entries are required in that file:

* project_file The file where to put the project configurations
* host The hostname or IP-Address where the service should listen
* port The port where the service should listen
* project_cookie_name The cookie name
* auth_cookie_name The authentication cookie name
* session_secret A secret string for cookie encryption

Running
=======

You can start the service with:

	tualo-ide start

Stoping the service simply call:

	tualo-ide stop

For restarting the service simply call:

	tualo-ide restart

You also can run the service as single instance:

	tualo-ide

After the service is started successfully open the browser and browse to http://[your host]:[your port]/.

