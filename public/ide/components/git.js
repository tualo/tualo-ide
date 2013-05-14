Ext.define('Ext.tualo.ide.components.GIT', {
	extend: 'Ext.util.Observable',
	constructor: function (config) {
		this.projectID = config.projectID;
		this.callParent([ config ]);
	},
	status: function(fileName){
		Ext.Ajax.request({
			url: '/'+this.projectID+'/git/status',
			scope: this,
			params: {
				file: fileName
			},
			success: function(response){
				try{
					var text = response.responseText;
					alert(text);
				}catch(error){
					console.log(error);
				}
			}
		})
	},
	commit: function(fileName){
		var scope = this;
		Ext.MessageBox.prompt(
			scope.dictionary.get('git.prompt.commitTitle'),
			scope.dictionary.get('git.prompt.commitQuestion',fileName),
			function(scope,fileName){
				return function(ans,txt){
					if (txt!=='') // no empty messages are allowed
					if (ans==='ok'){
						Ext.Ajax.request({
							url: '/'+scope.projectID+'/git/commit',
							scope: scope,
							params: {
								file: fileName,
								message: txt
							},
							success: function(response){
								var scope = this;
								try{
									var text = response.responseText;
									var o = Ext.JSON.decode(text);
									if (o.success){
										scope.fireEvent('changed',o.file);
									}else{
										Ext.MessageBox.show({
											title: scope.dictionary.get('gitException'),
											msg: o.msg,
											icon: Ext.MessageBox.ERROR,
											buttons: Ext.MessageBox.OK
										});
									}
								}catch(error){
									console.log(error);
								}
							},
							failure: function(){
								var scope = this;
								Ext.MessageBox.show({
									title: scope.dictionary.get('gitException'),
									msg: scope.dictionary.get('gitNoResponse'),
									icon: Ext.MessageBox.ERROR,
									buttons: Ext.MessageBox.OK
								});
							}
						})
					}
				}
			}(scope,fileName)
		);
		
	},
	ignore: function(fileName){
		Ext.Ajax.request({
			url: '/'+this.projectID+'/git/ignore',
			scope: this,
			params: {
				file: fileName
			},
			success: function(response){
				var scope = this;
				try{
					var text = response.responseText;
					var o = Ext.JSON.decode(text);
					if (o.success){
						
					}else{
						Ext.MessageBox.show({
							title: scope.dictionary.get('gitException'),
							msg: o.msg,
							icon: Ext.MessageBox.ERROR,
							buttons: Ext.MessageBox.OK
						});
					}
				}catch(error){
					console.log(error);
				}
			},
			failure: function(){
				var scope = this;
				Ext.MessageBox.show({
					title: scope.dictionary.get('gitException'),
					msg: scope.dictionary.get('gitNoResponse'),
					icon: Ext.MessageBox.ERROR,
					buttons: Ext.MessageBox.OK
				});
			}
		})
	},
	add: function(fileName){
		Ext.Ajax.request({
			url: '/'+this.projectID+'/git/add',
			scope: this,
			params: {
				file: fileName
			},
			success: function(response){
				var scope = this;
				try{
					var text = response.responseText;
					var o = Ext.JSON.decode(text);
					if (o.success){
						scope.fireEvent('changed',o.file);
					}else{
						Ext.MessageBox.show({
							title: scope.dictionary.get('gitException'),
							msg: o.msg,
							icon: Ext.MessageBox.ERROR,
							buttons: Ext.MessageBox.OK
						});
					}
				}catch(error){
					Ext.MessageBox.show({
						title: scope.dictionary.get('gitException'),
						msg: response.responseText,
						icon: Ext.MessageBox.ERROR,
						buttons: Ext.MessageBox.OK
					});
				}
			},
			failure: function(){
				var scope = this;
				Ext.MessageBox.show({
					title: scope.dictionary.get('gitException'),
					msg: scope.dictionary.get('gitNoResponse'),
					icon: Ext.MessageBox.ERROR,
					buttons: Ext.MessageBox.OK
				});
			}
		})
	},
	push: function(fileName){
		Ext.Ajax.request({
			url: '/'+this.projectID+'/git/push',
			scope: this,
			params: {
				file: fileName
			},
			success: function(response){
				var scope = this;
				try{
					var text = response.responseText;
					var o = Ext.JSON.decode(text);
					if (o.success){
						scope.fireEvent('pushed',o.file);
					}else{
						Ext.MessageBox.show({
							title: scope.dictionary.get('gitException'),
							msg: o.msg,
							icon: Ext.MessageBox.ERROR,
							buttons: Ext.MessageBox.OK
						});
					}
				}catch(error){
					Ext.MessageBox.show({
						title: scope.dictionary.get('gitException'),
						msg: response.responseText,
						icon: Ext.MessageBox.ERROR,
						buttons: Ext.MessageBox.OK
					});
				}
			},
			failure: function(){
				var scope = this;
				Ext.MessageBox.show({
					title: scope.dictionary.get('gitException'),
					msg: scope.dictionary.get('gitNoResponse'),
					icon: Ext.MessageBox.ERROR,
					buttons: Ext.MessageBox.OK
				});
			}
		})
	}
});