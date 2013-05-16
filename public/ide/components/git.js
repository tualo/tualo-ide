Ext.define('Ext.tualo.ide.components.GIT', {
	extend: 'Ext.util.Observable',
	constructor: function (config) {
		this.projectID = config.projectID;
		this.callParent([ config ]);
	},
	status: function(fileName){
		Ext.MessageBox.wait(this.dictionary.get('pleaseWaitTitle'),this.dictionary.get('pleaseWait'));
		Ext.Ajax.request({
			url: '/'+this.projectID+'/git/status',
			scope: this,
			params: {
				file: fileName
			},
			success: function(response){
				var scope = this;
				Ext.MessageBox.hide();
				try{
					var text = response.responseText;
					var o = Ext.JSON.decode(text);
					if (o.success){
						scope.fireEvent('status',o);
					}
				}catch(error){
					console.log(error);
				}
			},
			failure: function(){
				Ext.MessageBox.hide();
				// show message!
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
						Ext.MessageBox.wait(scope.dictionary.get('pleaseWaitTitle'),scope.dictionary.get('pleaseWait'));
						Ext.Ajax.request({
							url: '/'+scope.projectID+'/git/commit',
							scope: scope,
							params: {
								file: fileName,
								message: txt
							},
							success: function(response){
								var scope = this;
								Ext.MessageBox.hide();
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
								Ext.MessageBox.hide();
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
	tag: function(fileName){
		var scope = this;
		Ext.MessageBox.prompt(
			scope.dictionary.get('git.prompt.tagTitle'),
			scope.dictionary.get('git.prompt.tagQuestion',fileName),
			function(scope,fileName){
				return function(ans,txt){
					
					 // no empty messages are allowed
					if (ans==='ok'){
						
						if (txt===''){
							Ext.MessageBox.show({
								title: scope.dictionary.get('gitException'),
								msg: scope.dictionary.get('git.error.emptyTag'),
								icon: Ext.MessageBox.ERROR,
								buttons: Ext.MessageBox.OK
							});
							return; // do nothing
						}
						
						if(txt.indexOf(' ')>-1){
							Ext.MessageBox.show({
								title: scope.dictionary.get('gitException'),
								msg: scope.dictionary.get('git.error.whiteSpaceTag'),
								icon: Ext.MessageBox.ERROR,
								buttons: Ext.MessageBox.OK
							});
							return; // do nothing
						}
						
						Ext.MessageBox.prompt(
							scope.dictionary.get('git.prompt.tagTitle'),
							scope.dictionary.get('git.prompt.committagQuestion',fileName),
							function(scope,fileName){
								return function(ans,msg){
									
									 // no empty messages are allowed
									if (ans==='ok'){
										
										if (msg===''){
											Ext.MessageBox.show({
												title: scope.dictionary.get('gitException'),
												msg: scope.dictionary.get('git.error.emptyMessage'),
												icon: Ext.MessageBox.ERROR,
												buttons: Ext.MessageBox.OK
											});
											return; // do nothing
										}
										
										
										Ext.Ajax.request({
											url: '/'+scope.projectID+'/git/tag',
											scope: scope,
											params: {
												file: fileName,
												tag: txt,
												message: msg
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
	push: function(fileName,tags){
		Ext.MessageBox.wait(this.dictionary.get('pleaseWaitTitle'),this.dictionary.get('pleaseWait'));
		Ext.Ajax.request({
			url: '/'+this.projectID+'/git/push'+( (tags===true)?'tags':'' ),
			scope: this,
			params: {
				file: fileName
			},
			success: function(response){
				Ext.MessageBox.hide();
				var scope = this;
				try{
					var text = response.responseText;
					var o = Ext.JSON.decode(text);
					if (o.success){
						Ext.MessageBox.show({
							title: scope.dictionary.get('git.message.push.successTitle'),
							msg: scope.dictionary.get('git.message.push.successText'),
							icon: Ext.MessageBox.INFO,
							buttons: Ext.MessageBox.OK
						});
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
				Ext.MessageBox.hide();
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