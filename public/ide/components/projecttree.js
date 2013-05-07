Ext.define('Ext.tualo.ide.components.ProjectTree', {
	extend: 'Ext.panel.Panel',
	requires: ['Ext.tree.Panel','Ext.data.TreeStore'],
	projectID: 'none',
	constructor: function (config) {
		this.projectID = config.projectID;
		this.projectTitle = config.projectTitle;
		this.callParent([ config ]);
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
				load: function(store,records){
					/*
					if (typeof this.delayedFilterID!=='undefined'){
						window.clearTimeout(this.delayedFilterID);
					}
					this.delayedFilterID = Ext.Function.defer(this.delayedFilter, 2000, this, []);
					*/
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
			}
		});
		scope.items = [scope.treePanel];
		scope.callParent(arguments);
	}
});