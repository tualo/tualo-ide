Ext.define('Ext.tualo.ide.components.GitWindow', {
	extend: 'Ext.window.Window',
	layout: 'fit',
	requires:[
		'Ext.tualo.ide.components.GIT',
		'Ext.tab.Panel'
	],
	constructor: function (config) {
		this.projectID = config.projectID;
		this.dictionary = config.dictionary;
		this.projectTitle = config.projectTitle;
		this.title = 'GIT: '+this.projectTitle; 
		this.callParent([ config ]);
	},
	load: function(){
		this.git.status('');
	},
	initComponent: function () {
		var scope =this;
		this.git = Ext.create('Ext.tualo.ide.components.GIT',{
			projectID: scope.projectID,
			dictionary: scope.dictionary,
			listeners: {
				scope: scope,
				status: function(statusObject){
					var scope =this;
					scope.staged.getStore().loadData(statusObject.status.staged);
					var del = [];
					var nst = [];
					for(var i in statusObject.status.notstaged){
						if (statusObject.status.notstaged[i].state=='deleted'){
							del.push(statusObject.status.notstaged[i]);
						}else{
							nst.push(statusObject.status.notstaged[i]);
						}
					}
					scope.notstaged.getStore().loadData(nst);
					scope.deleted.getStore().loadData(del);
					scope.untracked.getStore().loadData(statusObject.status.untracked);
					scope.ignored.getStore().loadData(statusObject.status.ignored);
				}
			}
		});
		Ext.define('GitFile', {
			extend: 'Ext.data.Model',
			fields: [
				{name: 'file', type: 'string'},
				{name: 'state',  type: 'string'}
			]
		});
		scope.ignored = Ext.create('Ext.grid.Panel',{
			title: scope.dictionary.get('git.grid.IgnoredFiles'),
			store: Ext.create('Ext.data.Store', {
				model: 'GitFile',
				data : [     ]
			}),
			columns: [
				{
					text: scope.dictionary.get('git.grid.fileName'),
					dataIndex: 'file',
					flex: 2
				},
				{
					text: scope.dictionary.get('git.grid.fileStatus'),
					dataIndex: 'state',
					flex: 1
				}
			]
		});
		scope.deleted = Ext.create('Ext.grid.Panel',{
			title: scope.dictionary.get('git.grid.DeletedFiles'),
			store: Ext.create('Ext.data.Store', {
				model: 'GitFile',
				data : [     ]
			}),
			columns: [
				{
					text: scope.dictionary.get('git.grid.fileName'),
					dataIndex: 'file',
					flex: 2
				},
				{
					text: scope.dictionary.get('git.grid.fileStatus'),
					dataIndex: 'state',
					flex: 1
				}
			]
		});
		scope.staged = Ext.create('Ext.grid.Panel',{
			title: scope.dictionary.get('git.grid.StagedFiles'),
			store: Ext.create('Ext.data.Store', {
				model: 'GitFile',
				data : []
			}),
			columns: [
				{
					text: scope.dictionary.get('git.grid.fileName'),
					dataIndex: 'file',
					flex: 2
				},
				{
					text: scope.dictionary.get('git.grid.fileStatus'),
					dataIndex: 'state',
					flex: 1
				}
			]
		});
		scope.notstaged = Ext.create('Ext.grid.Panel',{
			title: scope.dictionary.get('git.grid.NotStagedFiles'),
			store: Ext.create('Ext.data.Store', {
				model: 'GitFile',
				data : [     ]
			}),
			columns: [
				{
					text: scope.dictionary.get('git.grid.fileName'),
					dataIndex: 'file',
					flex: 2
				},
				{
					text: scope.dictionary.get('git.grid.fileStatus'),
					dataIndex: 'state',
					flex: 1
				}
			]
		});
		scope.untracked = Ext.create('Ext.grid.Panel',{
			title: scope.dictionary.get('git.grid.UntrackedFiles'),
			store: Ext.create('Ext.data.Store', {
				model: 'GitFile',
				data : [     ]
			}),
			columns: [
				{
					text: scope.dictionary.get('git.grid.fileName'),
					dataIndex: 'file',
					flex: 2
				},
				{
					text: scope.dictionary.get('git.grid.fileStatus'),
					dataIndex: 'state',
					flex: 1
				}
			]
		});
		
		scope.tab = Ext.create('Ext.tab.Panel',{
			activeTab: 0,
			items:[
				scope.staged,
				scope.notstaged,
				scope.untracked,
				scope.deleted,
				scope.ignored
			],
			listeners: {
				scope: scope,
				add: function(tabPanel, component, index, eOpts ){
					component.doLayout();
				},
				activate: function(component,eOpt){
					component.doLayout();
				}
			}
		})
		scope.items=[
			scope.tab
		];
		scope.callParent(arguments);
		scope.load();
	}
})