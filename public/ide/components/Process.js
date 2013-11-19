Ext.define('Ext.tualo.ide.components.Process', {
	extend: 'Ext.panel.Panel',
	requires: ['Ext.form.field.TextArea'],
	projectID: 'none',
	constructor: function (config) {
		this.projectID = config.projectID;
		this.projectTitle = config.projectTitle;
		this.projectConfig = config.projectConfig;
		this.callParent([ config ]);
	}, 
	initComponent: function () {
		var scope = this;
		/*
		scope.layout = {
			// layout-specific configs go here
			type: 'accordion',
			titleCollapse: false,
			animate: true,
			activeOnTop: true
		};
		*/
		scope.layout = 'fit';
		scope.socket = io.connect(window.location.protocol+window.location.host+'/'+scope.projectID+'/'+'process');
		console.log(window.location.protocol+window.location.host+'/'+scope.projectID+'/'+'process');
		scope.socket.on('std',function(scope){
			return function(data){
				scope.setStdOutput(data,false)
			}
		}(scope));
		scope.socket.on('err',function(scope){
			return function(data){
				scope.setErrOutput(data,false)
			}
		}(scope));
		scope.divID = Ext.id();
		scope.std = Ext.create('Ext.panel.Panel',{
			title: scope.dictionary.get("standardOutputTitle"),
			html: '<div id="std-'+scope.divID+'" style="width:100%;height:100%;overflow:auto;"></div>',
			tools: [
					{
						text: '',
						scope: scope,
						type: 'stop',
						tooltip: scope.dictionary.get('stopProcess'),
						handler: function(){
							var scope = this;
							scope.stopProcess();
						}
					}
			]
		});
		/* removed, errors will be displayed red in a single output window
		scope.err = Ext.create('Ext.panel.Panel',{
			title: scope.dictionary.get("errorOutputTitle"),
			html: '<div id="err-'+scope.divID+'" style="width:100%;height:100%;overflow:auto;"></div>',
			tools: [
					{
						text: '',
						scope: scope,
						type: 'placeholder',
						//tooltip: scope.dictionary.get('stopProcess'),
						handler: function(){
							 
						}
					}
			]
		});
		*/
		scope.items = [ scope.std ];//,scope.err ];
		scope.callParent(arguments);
		
	},
	setStdOutput: function(txt,noAppend){
		var scope =  this;
		var el = window.document.getElementById('std-'+scope.divID);
		var html = el.innerHTML;
		var output = [];
		if (!noAppend){
			output.push(html);
		}
		output.push(scope.formatConsoleText(txt));
		el.innerHTML=output.join('<br/>');
	},
	setErrOutput: function(txt,noAppend){
		var scope =  this;
		var el = window.document.getElementById('std-'+scope.divID);
		var html = el.innerHTML;
		var output = [];
		if (!noAppend){
			output.push(html);
		}
		output.push('<span style="color:red;">'+scope.formatConsoleText(txt)+'</span>');
		el.innerHTML=output.join('<br/>');
	},
	formatConsoleText: function(txt){
		return txt.replace(/\n/g,"<br/>").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;");
	},
	startProcess: function(index){
		var scope = this;
		scope.stopProcess();
		scope.setStdOutput('',true);
		scope.setErrOutput('',true);
		scope.socket.emit('start process',{});
	},
	stopProcess: function(index){
		var scope = this;
		scope.socket.emit('stop process',{});
		scope.setStdOutput('Process stopped',false);
	}
});