// Sample Text
Ext.define('Ext.tualo.ide.components.InitProject', {
	extend: 'Ext.container.Viewport',
	requires: [
		'Ext.panel.Panel'
	],
	layout: 'fit',
	constructor: function (config) {
		this.callParent([ config ]);
	},
	initComponent: function () {
		var scope =this;
		scope.files = [];
		
		
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
		
		var store = Ext.create('Ext.data.TreeStore', {
			model: this.modelID,
			proxy: {
				type: 'ajax',
				api: {
					read: '/projects/list'
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
			}
		});
		scope.xid = Ext.id();
		scope.treePanel = Ext.create('Ext.tree.Panel', {
			region: 'west',
			split: true,
			width: 300,
			store: store,
			rootVisible: true,
			root: {
				text: scope.dictionary.get('ProjectsTreeTitle'),
				expanded: true,
				type: 'folder',
				id: ''
			},
			listeners: {
				scope: scope,
				itemclick: function( scope, record, item, index, e, eOpts ){
					var scope = this;
					if (record.get('id')!==''){
						scope.defaultProjectForm.getForm().load({
							params: {
								name: record.get('id')
							}
						})
						scope.defaultProjectForm.setTitle(record.get('text'));
						Ext.getCmp('save-'+scope.xid).setText(scope.dictionary.get('formProjectSaveBtn'));
					}
				},
				itemdblclick: function( scope, record, item, index, e, eOpts ){
					if (record.get('id')!==''){
						window.open(window.location.href+record.get('id'),'_blank',
						[
							'location=no',
							'menubar=no',
							'status=no',
							'toolbar=no',
							'titlebar=no'
						].join(','));
					}
				},
				itemcontextmenu: function( tPanel, record, item, index, e, eOpts ){
					//var p= e.getXY();
					//scope.menu.showAt(p);
					e.preventDefault();
					e.stopEvent();
					return false;
				}
			}
		});
		
		scope.defaultProjectForm = Ext.create('Ext.form.Panel',{
			title: scope.dictionary.get('newDefaultProjectTitle'),
			layout: 'anchor',
			url: '/projects/form',
			bodyPadding: 25,
			defaults: {
					anchor: '100%'
			},
			defaultType: 'textfield',
			items: [{
				fieldLabel: scope.dictionary.get('formProjectTitle'),
				name: 'title',
				allowBlank: false
			},{
				fieldLabel: scope.dictionary.get('formProjectName'),
				name: 'name',
				//regex: /[a-z0-9\.]/ig,
				//regexText: scope.dictionary.get('formProjectNameInvalid'),
				allowBlank: false
			},{
				fieldLabel: scope.dictionary.get('formProjectBasePath'),
				name: 'basepath',
				allowBlank: false
			},{
				fieldLabel: scope.dictionary.get('formProjectProcessCommand'),
				name: 'cmd',
				allowBlank: true
			},{
				fieldLabel: scope.dictionary.get('formProjectProcessCommandArgument'),
				name: 'arg',
				allowBlank: true
			}],
			buttons:[
				{
					text: scope.dictionary.get('newDefaultProjectTitle'),
					scope: this,
					handler: function() {
						var scope =this;
						var form = scope.defaultProjectForm.getForm();
						form.reset();
						scope.defaultProjectForm.setTitle(scope.dictionary.get('newDefaultProjectTitle'));
						Ext.getCmp('save-'+scope.xid).setText(scope.dictionary.get('formProjectSaveNew'));
					}
				},
				'->',
				{
					text: scope.dictionary.get('formProjectSaveNew'),
					formBind: true, //only enabled once the form is valid
					disabled: true,
					scope: this,
					id: 'save-'+scope.xid,
					handler: function() {
						var scope = this;
						var form = scope.defaultProjectForm.getForm();
						if (form.isValid()) {
							form.submit({
								success: function(form, action) {
									scope.treePanel.getStore().load(scope.treePanel.getRootNode());
									Ext.Msg.alert(scope.dictionary.get('formProjectSaveSuccessTitle'), scope.dictionary.get('formProjectSaveSuccessText'));
								},
								failure: function(form, action) {
									scope.treePanel.getStore().load(scope.treePanel.getRootNode());
									Ext.Msg.alert(scope.dictionary.get('formProjectSaveErrorTitle'), scope.dictionary.get('formProjectSaveErrorText'));
								}
							});
						}
					}
				}
			]
		})
		scope.overview = Ext.create('Ext.panel.Panel',{
			region: 'center',
			layout: 'card',
			items:[
				scope.defaultProjectForm
			]
		});
		 
		scope.items = [
			Ext.create('Ext.panel.Panel',{
				title: 'tualo IDE',
				layout: {
					type: 'border',
					padding: 5
				},
				items: [scope.treePanel,scope.overview]
			})
		]
		scope.callParent(arguments);
	}
});