Ext.Loader.setConfig({enabled: true});
Ext.Loader.setPath('Ext.tualo.ide.components', '/ide/components');
Ext.Loader.setPath('Ext.tualo.ide.language', '/ide/language');


Ext.application({
    name: 'tualo IDE',
    require: ['Ext.tualo.ide.components.InitProject','Ext.tualo.ide.language.Dictionary'],
    launch: function() {
        Ext.setGlyphFontFamily('FontAwesome');
        Ext.tip.QuickTipManager.init();
        Ext.create('Ext.tualo.ide.language.Dictionary', {
            loadLanguage: window.navigator.language,
            listeners:{
                loaded: function(dict){
                    Ext.create('Ext.tualo.ide.components.InitProject', {
                        dictionary: dict
                    });
                }
            }
        });

    }
});