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
	operate: function(operation,records,index){
		var scope = this;
		scope.operateProgressRecords = records;
		if (records.length==0) return; // do nothing, if no records were given
		if (records.length>index){
			if (index==0){
				scope.operateProgress = Ext.MessageBox.progress(scope.dictionary.get('pleaseWaitTitle'),scope.dictionary.get('pleaseWait'));
			}
			scope.operateProgressOperation = operation;
			scope.operateProgressIndex = index;
			scope.operateProgress.updateProgress( index/records.length);
			if (operation=='delete'){
				scope.git.rm('/'+records[index].get('file'));
			}
			if (operation=='add'){
				scope.git.add('/'+records[index].get('file'));
			}
			if (operation=='commit'){
				if (index==0){
					Ext.MessageBox.prompt(
						scope.dictionary.get('git.prompt.commitTitle'),
						scope.dictionary.get('git.prompt.commitQuestion','*selected Files*'),
						function(scope,fileName){
							return function(ans,txt){
								if (txt!=='') // no empty messages are allowed
									if (ans==='ok'){
										scope.operateProgressMessage = txt;
										scope.git.commitMsg('/'+fileName,txt);
									}
							}
						}(scope,records[index].get('file'))
					);
				}else{
					scope.git.commitMsg('/'+records[index].get('file'),scope.operateProgressMessage);
				}
			}
		}else{
			scope.operateProgress.hide();
			scope.load();
		}
	},
	initComponent: function () {
		var scope =this;
		this.git = Ext.create('Ext.tualo.ide.components.GIT',{
			projectID: scope.projectID,
			dictionary: scope.dictionary,
			listeners: {
				scope: scope,
				changed: function(fileName){
					var scope =this;
					scope.operate(scope.operateProgressOperation,scope.operateProgressRecords,scope.operateProgressIndex+1);
				},
				commitMsg: function(fileName){
					var scope =this;
					scope.operate(scope.operateProgressOperation,scope.operateProgressRecords,scope.operateProgressIndex+1);
				},
				removed: function(fileName){
					var scope =this;
					scope.operate(scope.operateProgressOperation,scope.operateProgressRecords,scope.operateProgressIndex+1);
				},
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
			selModel: Ext.create('Ext.selection.RowModel',{
				mode: 'MULTI'
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
			selModel: Ext.create('Ext.selection.RowModel',{
				mode: 'MULTI'
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
			],
			bbar:[
				'->',
				{
					text: scope.dictionary.get('git.grid.delete.selectedFiles'),
					scope: scope,
					handler: function(btn){
						var scope=this;
						scope.operate('remove',scope.deleted.getSelectionModel().getSelection(),0);
					}
				}
			]
		});
		scope.staged = Ext.create('Ext.grid.Panel',{
			title: scope.dictionary.get('git.grid.StagedFiles'),
			store: Ext.create('Ext.data.Store', {
				model: 'GitFile',
				data : []
			}),
			selModel: Ext.create('Ext.selection.RowModel',{
				mode: 'MULTI'
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
			],
			bbar:[
				'->',
				{
					text: scope.dictionary.get('git.grid.commit.selectedFiles'),
					scope: scope,
					handler: function(btn){
						var scope=this;
						scope.operate('commit',scope.staged.getSelectionModel().getSelection(),0);
					}
				}
			]
		});
		scope.notstaged = Ext.create('Ext.grid.Panel',{
			title: scope.dictionary.get('git.grid.NotStagedFiles'),
			store: Ext.create('Ext.data.Store', {
				model: 'GitFile',
				data : [     ]
			}),
			selModel: Ext.create('Ext.selection.RowModel',{
				mode: 'MULTI'
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
			],
			bbar:[
				'->',
				{
					text: scope.dictionary.get('git.grid.add.selectedFiles'),
					scope: scope,
					handler: function(btn){
						var scope=this;
						scope.operate('add',scope.notstaged.getSelectionModel().getSelection(),0);
					}
				}
			]
		});
		scope.untracked = Ext.create('Ext.grid.Panel',{
			title: scope.dictionary.get('git.grid.UntrackedFiles'),
			store: Ext.create('Ext.data.Store', {
				model: 'GitFile',
				data : [     ]
			}),
			selModel: Ext.create('Ext.selection.RowModel',{
				mode: 'MULTI'
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
			],
			bbar:[
				'->',
				{
					text: scope.dictionary.get('git.grid.add.selectedFiles'),
					scope: scope,
					handler: function(btn){
						var scope=this;
						scope.operate('add',scope.untracked.getSelectionModel().getSelection(),0);
					}
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