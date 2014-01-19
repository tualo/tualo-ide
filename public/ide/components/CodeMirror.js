Ext.define('Ext.tualo.ide.components.CodeMirror', {
    extend: 'Ext.panel.Panel',
    projectTheme: 'solarized',
    constructor: function (config) {
        this.data = config.data;
        this.mode = config.mode;
        this.fileId = config.fileId;
        this.callParent([ config ]);
    },
    initComponent: function () {
        this.editorID = Ext.id();
        this.html = '<div style="width:100%;height:100%;overflow:auto;" id="'+this.editorID+'"></div>';
        this.on('show',this._showMe);
        this.on('render',this._renderMe);

        // set up the keymap 
        CodeMirror.keyMap[this.editorID] =  {
            'Cmd-S': this.save.bind(this),
            'Ctrl-S': this.save.bind(this),
            'Ctrl-B': this.beautify.bind(this),
            'Tab': this.tab.bind(this),
            'fallthrough': ['default']
        };

        this.callParent(arguments);

    },
    tab: function(cm) {
        var spaces = Array(cm.getOption("indentUnit") + 1).join(" ");
        cm.replaceSelection(spaces, "end", "+input");
    },
    focus: function(){
        var scope=this;
        scope.CodeMirror.focus();
    },
    save: function(){
        var scope = this;
        scope.fireEvent('saveRequest',scope)
    },
    beautify: function(){
        var scope = this;
        scope.fireEvent('beautifyRequest',scope)
    },
    getContent: function(){
        if (typeof this.CodeMirror==='undefined'){
            return "";
        }
        return this.CodeMirror.doc.getValue("\n");
    },
    setContent: function(content){
        if (typeof this.CodeMirror==='undefined'){
            return "";
        }
        return this.CodeMirror.doc.setValue(content);
    },
    markClean: function(){
        if (typeof this.CodeMirror==='undefined'){
            return true;
        }
        return this.CodeMirror.doc.markClean();
    },
    isClean: function(){
        if (typeof this.CodeMirror==='undefined'){
            return true;
        }
        return this.CodeMirror.doc.isClean();
    },
    doLayout: function(){
        var scope = this;
        scope.callParent(arguments);
        scope._showMe();
    },
    setFocus: function(){

    },
    _showMe: function(){
        var scope = this;

        if (typeof scope.CodeMirror!=='undefined'){
            scope.CodeMirror.refresh();
        }
    },
    _renderMe: function(scope){
        var addTo = window.document.getElementById(scope.editorID),
            config;
        config = {
            value: scope.data,
            mode: scope.mode,
            theme: scope.projectTheme,
            lineNumbers: true,
            indentWithTabs: false,
            gutters: ["CodeMirror-linenumbers", "breakpoints", "warnings"],
            tabSize: 4,
            indentUnit: 4,
            viewportMargin: 0,
            keyMap: scope.editorID,
            matchBrackets: true,
            highlightSelectionMatches: true,


        }
        if (config.mode==='json'){
            config.mode = {name: "javascript", json: true};
        }
        scope.CodeMirror = CodeMirror(addTo, config);



        scope.CodeMirror.on('change',function(scope){
            return function (cm,chgObj){ 
                scope.fireEvent('contentChanged',scope,chgObj); 
            }
        }(scope));

        // is needed, because direct callof _showMe() does not work
        window.setTimeout(scope._showMe.bind(scope),100);
    }
});