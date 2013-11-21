// Sample Text
Ext.define('Ext.tualo.ide.components.Project', {
	extend: 'Ext.panel.Panel',
	requires: [
		'Ext.tualo.ide.components.TabScroller',
		'Ext.tualo.ide.components.ProjectTree',
		'Ext.tualo.ide.components.IO',
		'Ext.tualo.ide.components.GIT',
		'Ext.tualo.ide.components.CodeMirror',
		'Ext.tualo.ide.components.Process',
		'Ext.tualo.ide.components.GitWindow'
	],
	projectID: 'none',
	layout: 'fit',
	inSingleWindow: true,
	focus: function(){
		//console.log('Doing refocus');
		var scope = this;
		var currentFile = scope.center.getActiveTab().fileId;
		scope.files[currentFile].focus();
		//scope.center.getActiveTab().focus();
	},
	constructor: function (config) {
		this.projectID = config.projectID;
		this.projectTitle = config.projectTitle;
		
		this.callParent([ config ]);
	},
	_getTreeState: function(node){
		var _nodes = {
			id: node.get('id'),
			expanded: node.isExpanded()
		};
		if (node.childNodes.length>0){
			_nodes.childs=[];
			for(var i in node.childNodes){
				_nodes.childs.push(this._getTreeState(node.childNodes[i]));
			}
		}
		return _nodes;
	},
	_reloadTree: function(){
		var scope =this;
		var root = scope.tree.treePanel.getRootNode();
		try{
			// git commits all staged changes
			// therefor the hole tree must be reloaded
			scope.tree.restore(scope._getTreeState(root)); // save the current tree state, for later expanding
			scope.tree.treePanel.getStore().load({node: root});
		}catch(e){
			alert(e);
		}
	},
	initComponent: function () {
		var scope =this;
		scope.files = [];
		
		
		this.git = Ext.create('Ext.tualo.ide.components.GIT',{
			projectID: scope.projectID,
			dictionary: scope.dictionary,
			listeners: {
				scope: scope,
				changed: function(fName){
					var scope =this;
					scope._reloadTree();
				},
				pushed: function(fName){
					var scope =this;
					scope._reloadTree();
				}
			}
		})
		
		this.io = Ext.create('Ext.tualo.ide.components.IO',{
			projectID: scope.projectID,
			projectTitle: scope.projectTitle,
			listeners: {
				scope: scope,
				fileopened: function(fileObject){
					this.addTab(fileObject);
					var nodeList = scope.tree.treePanel.getSelectionModel().getSelection();
					if (nodeList.length>0){
						var node = nodeList[0];
						if (node.get('leaf')!==true){
							scope.tree.treePanel.getStore().load({node: node});
						}
					}
					this.storeCurrentState();
				},
				filestat: function(response){
					var scope = this;
					var activeTab = scope.center.getActiveTab();
					if (activeTab.fileId==response.file){
						if (activeTab.mtime<response.mtime){
							Ext.MessageBox.confirm(
								scope.dictionary.get('project.file.changedExternally.title'),
								scope.dictionary.get('project.file.changedExternally.text'),
								function(btn){
									var scope = this;
									var activeTab = scope.center.getActiveTab();
									if (btn==='yes'){
										scope.io.open(activeTab.fileId);
									}
								}
								,scope
							);
						}
					}
				
				},
				fileadded: function(fileObject){
					this.addTab(fileObject);
					var nodeList = scope.tree.treePanel.getSelectionModel().getSelection();
					if (nodeList.length>0){
						var node = nodeList[0];
						if (node.get('leaf')!==true){
							scope.tree.treePanel.getStore().load({node: node});
						}
					}
					this.storeCurrentState();
				},
				filesaved: function(fileObject){
					if (typeof this.files[fileObject.id]!=='undefined'){
						this.files[fileObject.id].setTitle(fileObject.name);
						this.files[fileObject.id].mtime=fileObject.mtime
					}
					var nodeList = scope.tree.treePanel.getSelectionModel().getSelection();
					if (nodeList.length>0){
						var node = nodeList[0];
						if (node.get('leaf')!==true){
							scope.tree.treePanel.getStore().load({node: node});
						}
					}
					if (typeof this.files[fileObject.id]!=='undefined'){
						this.files[fileObject.id].markClean();
					}
					this.storeCurrentState();
				},
				folderadded: function(data){
					var nodeList = scope.tree.treePanel.getSelectionModel().getSelection();
					if (nodeList.length>0){
						var node = nodeList[0];
						if (node.get('leaf')!==true){
							scope.tree.treePanel.getStore().load({node: node});
						}
					}
				},
				filedeleted: function(data){
					var nodeList = scope.tree.treePanel.getSelectionModel().getSelection();
					if (nodeList.length>0){
						var node = nodeList[0];
						scope.tree.treePanel.getStore().load({node: node.parentNode});
					}
					this.storeCurrentState();
				},
				folderdeleted: function(data){
					var nodeList = scope.tree.treePanel.getSelectionModel().getSelection();
					if (nodeList.length>0){
						var node = nodeList[0];
						scope.tree.treePanel.getStore().load({node: node.parentNode});
					}
					this.storeCurrentState();
				},
				beautify: function(data){
					var scope = this;
					var panel = scope.center.getActiveTab();
					panel.setTitle(panel.name+'*');
					scope.files[panel.fileId].setContent(data.data);
					//scope.io.checkSyntax(panel.fileId,scope.files[panel.fileId].getContent());
					//scope.storeCurrentState();
				},
				syntaxChecked: function(data){
					var scope = this;
					if (typeof scope.files[data.id]!=='undefined'){
						var editor = scope.files[data.id].CodeMirror;
						editor.clearGutter("warnings");
						if (data.success===false){
							var info = editor.lineInfo(data.line);
							var obj = scope.makeWarningMarker(data.msg);
							editor.setGutterMarker(data.line, "warnings", info.markers ? null : obj);
						}
					}
				}
			}
		});
		
		
		var buttons = [];
		buttons.push({
			text: scope.dictionary.get('buttonSave'),
			glyph: 0xf0c7,
			scale: 'small',
				scope: scope,
				handler: function(){
					var scope = this;
					var panel = scope.center.getActiveTab();
					panel.save();
				}
		});
		
		if (false)
		buttons.push({
			text: scope.dictionary.get('buttonBeautify'),
			glyph: 0xf0c7,
			scale: 'small',
				scope: scope,
				handler: function(){
					var scope = this;
					var panel = scope.center.getActiveTab();
					panel.beautify();
				}
		});
		
		buttons.push('->');
		
		
		if (typeof scope.projectConfig.process!=='undefined'){
			// show process btn only if there is a commend defined
			buttons.push({
				text: scope.dictionary.get('buttonProcess'),
				glyph: 0xf0ae,
				scale: 'small',
				scope: scope,
				handler: function(){
					var scope = this;
					var processPanel = scope.process;
					console.log('start');
					processPanel.startProcess();
				}
			});
		}
		
		scope.toolbar = Ext.create('Ext.toolbar.Toolbar', {
			dock: 'top',
			items: buttons
		});
		
		scope.tree = Ext.create('Ext.tualo.ide.components.ProjectTree', {
			projectID: scope.projectID,
			projectTitle: scope.projectTitle,
			dictionary: scope.dictionary,
			region: 'west',
			width: 300,
			split: true,
			listeners: {
				scope: scope,
				filedblclick: function(config){
					var scope = this;
					if (typeof scope.files[config.id]==='undefined'){
						this.io.open(config.id);
					}else{
						scope.center.setActiveTab(scope.files[config.id]);
					}
				},
				addOfFolder: function(folder,newName){
					scope.io.addFolder(folder+'/'+newName);
				},
				addOfFile: function(folder,newName){
					scope.io.add(folder+'/'+newName);
				},
				deleteOfFolder: function(folderName){
					scope.io.delFolder(folderName);
				},
				deleteOfFile: function(fileName){
					scope.io.del(fileName);
				},
				gitStatus: function(fileName){
					var scope=this;
					var w = Ext.create('Ext.tualo.ide.components.GitWindow',{
						projectID: scope.projectID,
						projectTitle: scope.projectTitle,
						dictionary: scope.dictionary,
						modal: true,
						closeAction: 'destroy',
						width: scope.getWidth()*0.8,
						height: scope.getHeight()*0.8
					});
					w.show();
				},
				gitAdd: function(fileName){
					scope.git.add(fileName);
				},
				gitIgnoreFile: function(fileName){
					scope.git.ignore(fileName);
				},
				gitCommit: function(fileName){
					scope.git.commit(fileName);
				},
				gitPush: function(fileName){
					scope.git.push(fileName);
				},
				gitPushTags: function(fileName){
					scope.git.push(fileName,true);
				},
				gitTag: function(fileName){
					scope.git.tag(fileName);
				}
			}
		});
		
		scope.center = Ext.create('Ext.tab.Panel', {
			region: 'center',
			/*
			plugins: [{
				ptype: 'idetabscrollermenu',
				maxText  : 15,
				pageSize : 5
			}],
			*/
			items: [
				
			],
			listeners: {
				scope: scope,
				add: function(tabPanel, component, index, eOpts ){
					tabPanel.setActiveTab(index);
					component.doLayout();
				},
				activate: function(component,eOpt){
					//console.log(component);
					component.doLayout();
				},
				tabchange: function( tabPanel, newCard, oldCard, eOpts ){
					var scope = this;
					Ext.defer(scope.focus,100,scope);
					scope.io.stat(newCard.fileId);
				}
			}
		});
		
		
		scope.process = Ext.create('Ext.tualo.ide.components.Process',{
			split: true,
			region: 'south',
			height: 200,
			projectID: scope.projectID,
			projectTitle: scope.projectTitle,
			projectConfig: scope.projectConfig,
			dictionary: scope.dictionary
		});
		
		scope.centerWrapper = Ext.create('Ext.panel.Panel',{
			region: 'center',
			border: false,
			layout: {
				type: 'border',
				padding: 0
			},
			items: [scope.center,scope.process]
		})
		
		scope.wrapper = Ext.create('Ext.panel.Panel',{
			layout: {
				type: 'border',
				padding: 5
			},
			items: [scope.tree,scope.centerWrapper]
		})
		scope.items = scope.wrapper;
		scope.wrapper.addDocked(scope.toolbar);
		scope.callParent(arguments);
		
		scope.restoreCurrentState();
		
		
		if (scope.inSingleWindow===true){
			window.addEventListener("focus", function(event) {
				scope.focus();
		});
		}
		
	},
	addTab: function(fileObject){
		var scope = this;
		if (!scope._validFileObject(fileObject)){ 
			//console.log('_validFileObject returned false: nothing is done');
			return; // given object contains errors
		}
		
		if (typeof scope.files[fileObject.id]==='undefined'){ // do not open a file twice
			var edtTab = Ext.create('Ext.tualo.ide.components.CodeMirror', {
				title: fileObject.name,
				tabConfig: {
					tooltip: fileObject.id
				},
				closable: true,
				closeAction: 'destroy',
				toolTip: fileObject.id,
				name: fileObject.name,
				data: fileObject.data,
				mode: fileObject.mode,
				mtime: fileObject.mtime,
				fileId: fileObject.id,
				listeners: {
					scope: scope,
					saveRequest: scope._saveRequest,
					beautifyRequest: scope._beautifyRequest,
					contentChanged: scope._contentChanged,
					beforeclose: scope._beforeClose,
					close: scope._close
				}
			});
			scope.center.add(edtTab);
			scope.files[fileObject.id] = edtTab;
		}else{
			// the tab all ready exits, set it active
			var tab = scope.files[fileObject.id];
			
			tab.setContent(fileObject.data);
			tab.mtime = fileObject.mtime;
			tab.markClean();
			var title = tab.getTitle();
			tab.setTitle(title.replace('*',''));
			scope.center.setActiveTab(tab);
		}
		scope.storeCurrentState();
	},
	/**
	* Check if the given Object has all the needed properties
	* returns true if all needed properties exists, otherwise false
	* @param {object} fileObject
	*/
	_validFileObject: function(fileObject){
		if (typeof fileObject.id==='string')
			if (typeof fileObject.mode==='string')
				if (typeof fileObject.name==='string')
					if (typeof fileObject.data==='string')
						return true;
		return false;
	},
	/**
	* called when the codemirror save key combination was pressed
	*/
	_saveRequest: function(cmTab){
		var scope = this;
		scope.io.save(cmTab.fileId,cmTab.getContent());
	},
	/**
	* called when the codemirror beautify key combination was pressed
	*/
	_beautifyRequest: function(cmTab){
		var scope = this;
		scope.io.beautify(cmTab.fileId,cmTab.getContent());
	},
	
	/**
	* called when the codemirror save key combination was pressed
	*/
	_contentChanged: function(panel,chgObj){
		var scope = this;
		panel.setTitle(panel.name+'*');
		scope.io.checkSyntax(panel.fileId,scope.files[panel.fileId].getContent());
		scope.storeCurrentState();
	},
	/**
	* called before the tab panel is closed,
	* checkup for changed files happens here
	*/
	_beforeClose: function( panel, eOpts ){
		var scope = this;
		if (scope.files[panel.fileId].isClean()){
			return true; // can be removed
		}else{
			Ext.MessageBox.confirm(
				scope.dictionary.get('confirmCloseOfChangedFileTitle'),
				scope.dictionary.get('confirmCloseOfChangedFile',panel.name),
				function(scope,panel){
					return function(ans){
						if (ans==='yes'){
							scope.center.remove(panel,true);
							delete scope.files[panel.fileId];
						}
					}
				}(scope,panel)
			);
			return false;
		}
	},
	_close: function(panel, eOpts){
		var scope = this;
		delete scope.files[panel.fileId];
		scope.storeCurrentState();
	},
	makeBreakpointMarker: function() {
		var marker = document.createElement("div");
		marker.innerHTML = "●";
		marker.className = "breakpoint";
		return marker;
	},
	makeWarningMarker: function(msg) {
		var marker = document.createElement("div");
		marker.innerHTML = "*!";
		marker.title = msg;
		marker.className = "warning";
		return marker;
	},
	
	
	// Session settings
	restoreCurrentState: function(){
		var scope = this;
		var files = Ext.JSON.decode(localStorage.getItem(scope.projectID+"_openFiles"));
		var currentFile = localStorage.getItem(scope.projectID+"_currentFile");
		if (typeof files=='undefined'){
			files = [];
		}
		if (typeof currentFile=='undefined'){
			currentFile = '';
		}
		var cf = -1;
		for(var i in files){
			var fileObject = {
				name: files[i].fileName,
				data: files[i].content,
				mode: files[i].mode,
				mtime: files[i].mtime,
				id: files[i].id,
				isChanged: files[i].isChanged
			}
			scope.addTab(fileObject);
			if (currentFile==files[i].id){
				cf=i;
			}
		}
		if (files!=null){
			Ext.defer(scope._restoreCurrentStateReTap,500,this,[0,files.length,cf]);
		}
		scope.tree.restore(Ext.JSON.decode(localStorage.getItem(scope.projectID+"_treeState")));
	},
	_restoreCurrentStateReTap: function(index,max,cf){
		var scope = this;
		if (index<max){
			scope.center.setActiveTab(index);
			index++;
			Ext.defer(scope._restoreCurrentStateReTap,500,this,[index,max,cf]);
		}else{
			if (cf!=-1){
				scope.center.setActiveTab(cf);
			}
		}
	},
	// execution only delayed, for saving resources
	storeCurrentState: function(delayed){
		var scope = this;
		
		if (typeof delayed==='undefined'){
			delayed=true;
		}
		
		if (delayed===false){
			var files = [];
			try{
				for(var fileName in scope.files){
					if (typeof fileName==='string'){
						var content = scope.files[fileName].getContent();
						files.push({
							fileName: scope.files[fileName].name,
							content: content,
							mtime: scope.files[fileName].mtime,
							mode:  scope.files[fileName].mode,
							id:  fileName,
							isChanged: !scope.files[fileName].isClean()
						});
					}
				}
				var currentFile = scope.center.getActiveTab().fileId;
				localStorage.setItem(scope.projectID+"_openFiles", Ext.JSON.encode(files));
				localStorage.setItem(scope.projectID+"_currentFile", currentFile);
				localStorage.setItem(scope.projectID+"_treeState",Ext.JSON.encode(scope._getTreeState(scope.tree.treePanel.getRootNode())));
			}catch(err){
			
			}
			scope._IDstoreCurrentState=null;
			return;
		}
		
		if (typeof scope._IDstoreCurrentState==='undefined'){
			scope._IDstoreCurrentState=null;
		}
		
		if (scope._IDstoreCurrentState!==null){
			window.clearTimeout(scope._IDstoreCurrentState);
		}
		scope._IDstoreCurrentState = window.setTimeout(function(scope){
			return function(){
				scope.storeCurrentState(false);
			}
		}(scope),1000);
	},
	dropSavedState: function(){
		var scope = this;
		localStorage.setItem(scope.projectID+"_openFiles","");
		localStorage.setItem(scope.projectID+"_currentFile","");
		localStorage.setItem(scope.projectID+"_treeState","");
	}
});