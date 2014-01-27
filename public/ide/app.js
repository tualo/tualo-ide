Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.tualo.ide.components', '/ide/components');
Ext.Loader.setPath('Ext.tualo.ide.language', '/ide/language');


Ext.application({
    name: 'tualo IDE',
    require: ['Ext.tualo.ide.components.Project','Ext.tualo.ide.language.Dictionary'],
    launch: function() {
        Ext.setGlyphFontFamily('FontAwesome');
        Ext.MessageBox.minPromptWidth = 400;
        Ext.tip.QuickTipManager.init();
        Ext.create('Ext.tualo.ide.language.Dictionary', {
            loadLanguage: window.navigator.language,
            listeners:{
                loaded: function(dict){
                    var socket = io.connect('http://localhost:8085/');
                    socket.emit('gitstatus',{
                        projectID: projectID
                    });
                    Ext.create('Ext.container.Viewport',{
                        layout: 'fit',
                        items: [
                            Ext.create('Ext.tualo.ide.components.Project', {
                                projectID: projectID, // is set by layout.jade layout,
                                projectTitle: projectTitle,
                                projectConfig: projectConfig,
                                dictionary: dict,
                                socket: socket
                            })
                        ]
                    });
                }
            }
        });

    }
});