Ext.define('Ext.tualo.ide.components.ProjectTree', {
	extend: 'Ext.panel.Panel',
	requires: ['Ext.tree.Panel','Ext.data.TreeStore'],
	projectID: 'none',
	constructor: function (config) {
		this.projectID = config.projectID;
		this.projectTitle = config.projectTitle;
		this.callParent([ config ]);
	},
	inRestoreExpanded: function(id,point){
		if (typeof point==='undefined'){
			point = this._restore;
		}
		if (typeof point!=='undefined'){
			if (typeof point.id!=='undefined'){
				if (point.id===id){
					return point.expanded;
				}
				if (typeof point.childs!=='undefined'){
					var res=false;
					for(var i in point.childs){
						res|=this.inRestoreExpanded(id,point.childs[i]);
					}
					return res;
				}
			}
		}
		return false;
	},
	restore: function(obj){
		this._restore=obj;
	},
	initComponent: function () {
		var scope = this;
		
		scope.layout = 'fit';
		
		scope.modelID = Ext.id();
		Ext.define(this.modelID, {
			extend: 'Ext.data.Model',
			fields: [{
				name: 'id',
				type: 'string'
			}, {
				name: 'mtime',
				type: 'date'
			}, {
				name: 'text',
				type: 'string'
			}, {
				name: 'fsize',
				type: 'number'
			}, {
				name: 'type',
				type: 'string'
			}, {
				name: 'git_staged',
				type: 'boolean'
			}, {
				name: 'git_notstaged',
				type: 'boolean'
			}, {
				name: 'git_untracked',
				type: 'boolean'
			}]
		});
		
		scope.menu = Ext.create('Ext.menu.Menu', {
			items: [{
				text: scope.dictionary.get('addFileMenu'),
				scope: scope,
				handler: function(){
					var scope = this;
					var sel = scope.treePanel.getSelectionModel().getSelection();
					if (sel.length===1){
						sel=sel[0];
						var shortFileName =sel.get('text');
						var fileName =sel.get('id');
						var type = sel.get('type');
						if (type==='folder'){ // can only add files/folder to a folder
							
							Ext.MessageBox.prompt(
								scope.dictionary.get('promptAddOfFileTitle'),
								scope.dictionary.get('promptAddOfFile',shortFileName),
								function(scope,fileName){
									return function(ans,txt){
										if (ans==='ok'){
											scope.fireEvent('addOfFile',fileName,txt);
										}
									}
								}(scope,fileName)
							);
						}
					}
				}
			},{
				text: scope.dictionary.get('addFolderMenu'),
				scope: scope,
				handler: function(){
					var scope = this;
					var sel = scope.treePanel.getSelectionModel().getSelection();
					if (sel.length===1){
						sel=sel[0];
						var shortFileName =sel.get('text');
						var fileName =sel.get('id');
						var type = sel.get('type');
						if (type==='folder'){ // can only add files/folder to a folder
							Ext.MessageBox.prompt(
								scope.dictionary.get('promptAddOfFolderTitle'),
								scope.dictionary.get('promptAddOfFolder',shortFileName),
								function(scope,fileName){
									return function(ans,txt){
										if (ans==='ok'){
											scope.fireEvent('addOfFolder',fileName,txt);
										}
									}
								}(scope,fileName)
							);
						}
					}
				}
			},'-',{
				text: scope.dictionary.get('removeMenu'),
				scope: scope,
				handler: function(){
					var scope = this;
					var sel = scope.treePanel.getSelectionModel().getSelection();
					if (sel.length===1){
						sel=sel[0];
						var shortFileName =sel.get('text');
						var fileName =sel.get('id');
						var type = sel.get('type');
						if (type==='folder'){
							Ext.MessageBox.confirm(
								scope.dictionary.get('confirmDeleteOfFolderTitle'),
								scope.dictionary.get('confirmDeleteOfFolder',shortFileName),
								function(scope,fileName){
									return function(ans){
										if (ans==='yes'){
											scope.fireEvent('deleteOfFolder',fileName);
										}
									}
								}(scope,fileName)
							);
						}else{
							Ext.MessageBox.confirm(
								scope.dictionary.get('confirmDeleteOfFileTitle'),
								scope.dictionary.get('confirmDeleteOfFile',shortFileName),
								function(scope,fileName){
									return function(ans){
										if (ans==='yes'){
											
											scope.fireEvent('deleteOfFile',fileName);
										}
									}
								}(scope,fileName)
							);
						}
					}
				}
			},'-',{
				text: scope.dictionary.get('gitMenu'),
				menu: [
					{
						text: scope.dictionary.get('gitStatus'),
						scope: scope,
						handler: function(){
							var scope = this;
							var sel = scope.treePanel.getSelectionModel().getSelection();
							if (sel.length===1){
								sel=sel[0];
								var shortFileName =sel.get('text');
								var fileName =sel.get('id');
								var type = sel.get('type');
								scope.fireEvent('gitStatus',fileName);
							}
						}
					},'-',
					{
						text: scope.dictionary.get('gitAdd'),
						scope: scope,
						handler: function(){
							var scope = this;
							var sel = scope.treePanel.getSelectionModel().getSelection();
							if (sel.length===1){
								sel=sel[0];
								var shortFileName =sel.get('text');
								var fileName =sel.get('id');
								var type = sel.get('type');
								scope.fireEvent('gitAdd',fileName);
							}
						}
					},
					{
						text: scope.dictionary.get('git.menu.commit'),
						scope: scope,
						handler: function(){
							var scope = this;
							var sel = scope.treePanel.getSelectionModel().getSelection();
							if (sel.length===1){
								sel=sel[0];
								var shortFileName =sel.get('text');
								var fileName =sel.get('id');
								var type = sel.get('type');
								console.log(sel);
								if (sel.get('git_staged')===true){
									scope.fireEvent('gitCommit',fileName);
								}else{
									Ext.MessageBox.show({
										title: scope.dictionary.get('git.Information'),
										msg: scope.dictionary.get('git.commiting_not_staged'),
										icon: Ext.MessageBox.INFO,
										buttons: Ext.MessageBox.OK
									});
								}
							}
						}
					},'-',
					{
						text: scope.dictionary.get('gitPush'),
						scope: scope,
						handler: function(){
							var scope = this;
							var sel = scope.treePanel.getSelectionModel().getSelection();
							if (sel.length===1){
								sel=sel[0];
								var shortFileName =sel.get('text');
								var fileName =sel.get('id');
								var type = sel.get('type');
								scope.fireEvent('gitPush',fileName);
							}
						}
					}
					,'-',
					{
						text: scope.dictionary.get('gitIgnore'),
						scope: scope,
						handler: function(){
							var scope = this;
							var sel = scope.treePanel.getSelectionModel().getSelection();
							if (sel.length===1){
								sel=sel[0];
								var shortFileName =sel.get('text');
								var fileName =sel.get('id');
								var type = sel.get('type');
								scope.fireEvent('gitIgnoreFile',fileName);
							}
						}
					}
				]
			}]
		});
		
		var store = Ext.create('Ext.data.TreeStore', {
			model: this.modelID,
			proxy: {
				type: 'ajax',
				api: {
					read: '/'+scope.projectID+'/file/list'
				},
				reader: {
					type: 'json',
					successProperty: 'success',
					root: 'data',
					messageProperty: 'msg',
					totalProperty  : 'total'
				},
				listeners: {
					scope: this,
					exception: function(proxy, response, operation){
						try{
							var o = Ext.JSON.decode(response.responseText);
							Ext.MessageBox.show({
								title: 'REMOTE EXCEPTION',
								msg: o.msg,
								icon: Ext.MessageBox.ERROR,
								buttons: Ext.MessageBox.OK
							});
						}catch(e){
							Ext.MessageBox.show({
								title: 'REMOTE EXCEPTION',
								msg: response.responseText,
								icon: Ext.MessageBox.ERROR,
								buttons: Ext.MessageBox.OK
							});
						}
						
					}
				}
			},
			listeners: {
				scope: this,
				load: function(store,node,records,success,eOpts){
					if (typeof this._restoreLoad==='undefined'){
						this._restoreLoad=false;
					}
					// auto expand child nodes if they are stored for restoring
					for(var i in node.childNodes){
						if (this.inRestoreExpanded(node.childNodes[i].get('id'))){
							node.childNodes[i].expand();
						}
					}
				}
			}
		})
		
		scope.treePanel = Ext.create('Ext.tree.Panel', {
			title: scope.projectTitle,
			store: store,
			rootVisible: true,
			root: {
				text: scope.projectTitle,
				expanded: true,
				type: 'folder',
				id: ''
			},
			listeners: {
				scope: scope,
				itemdblclick: function( scope, record, item, index, e, eOpts ){
					if (record.get('type')!=='folder'){
						this.fireEvent( 'filedblclick', {
							type: record.get('type'),
							id: record.get('id'),
							name: record.get('text')
						}) 
					}
				},
				itemcontextmenu: function( tPanel, record, item, index, e, eOpts ){
					var p= e.getXY();
					scope.menu.showAt(p);
					e.preventDefault();
					e.stopEvent();
					return false;
				}
			},
			columns: [
				{
					xtype : 'treecolumn',
					dataIndex : 'text',
					flex: 1,
					renderer : function(value,meta, record){
						var style='color:#000;';
						if (record.get('git_staged')===true){
							style='color:rgb(0,0,190);';
						}
						if (record.get('git_untracked')===true){
							style='color:rgb(0,190,0);';
						}
						if (record.get('git_notstaged')===true){
							style='color:rgb(190,190,0);';
						}
						return '<span style="'+style+'">'+value+'</span>';
					}
				}
			]
		});
		scope.items = [scope.treePanel];
		scope.callParent(arguments);
	}
});