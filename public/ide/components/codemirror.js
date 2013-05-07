Ext.define('Ext.tualo.ide.components.CodeMirror', {
	extend: 'Ext.panel.Panel',
	projectTheme: 'solarized',
	constructor: function (config) {
		this.data = config.data;
		this.mode = config.mode;
		this.fileId = config.fileId;
		this.callParent([ config ]);
	},
	initComponent: function () {
		this.editorID = Ext.id();
		this.html = '<div style="width:100%;height:100%;overflow:auto;" id="'+this.editorID+'"></div>';
		this.on('show',this._showMe);
		this.on('render',this._renderMe);
		
		// set up the keymap 
		CodeMirror.keyMap[this.editorID] =  {
			'Cmd-S': function(scope){return function(cm){scope.save()}}(this),
			'Ctrl-S': function(scope){return function(cm){scope.save()}}(this),
			fallthrough: ['default']
		};
		
		this.callParent(arguments);
		
	},
	save: function(){
		var scope = this;
		scope.fireEvent('saveRequest',scope)
	},
	getContent: function(){
		if (typeof this.CodeMirror==='undefined'){
			return "";
		}
		return this.CodeMirror.doc.getValue("\n");
	},
	markClean: function(){
		if (typeof this.CodeMirror==='undefined'){
			return true;
		}
		return this.CodeMirror.doc.markClean();
	},
	isClean: function(){
		if (typeof this.CodeMirror==='undefined'){
			return true;
		}
		return this.CodeMirror.doc.isClean();
	},
	doLayout: function(){
		var scope = this;
		scope.callParent(arguments);
		scope._showMe();
	},
	setFocus: function(){
		
	},
	_showMe: function(){
		var scope = this;
		
		if (typeof scope.CodeMirror!=='undefined'){
			scope.CodeMirror.refresh();
		}
	},
	_renderMe: function(scope){
		var addTo = window.document.getElementById(scope.editorID);
		scope.CodeMirror = CodeMirror(addTo, {
			value: scope.data,
			mode:  scope.mode,
			theme: scope.projectTheme,
			lineNumbers: true,
			indentWithTabs: true,
			gutters: ["CodeMirror-linenumbers", "breakpoints", "warnings"],
			tabSize: 2,
			viewportMargin: 0,
			keyMap: scope.editorID,
			matchBrackets: true,
			highlightSelectionMatches: true
		});
		
		
		
		scope.CodeMirror.on('change',function(scope){
			return function (cm,chgObj){ 
				scope.fireEvent('contentChanged',scope,chgObj); 
			}
		}(scope));
		
		// is needed, because direct callof _showMe() does not work
		window.setTimeout(function(scope){return function(){scope._showMe();}}(scope),100);
	}
});