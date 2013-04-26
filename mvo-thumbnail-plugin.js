// Liste et paths des fichiers dependants
require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    jquery: {
      exports: '$'
    },
    jqueryUI: {
            exports: "$",
            deps: ['jquery']
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    },
    jcrop: {
        deps: ['jquery']
    }
  },
  paths: {
    jquery: 'assets/js/jquery-min',
    jqueryUI: 'assets/js/jquery-ui',
    text:'assets/js/text',
    underscore: 'assets/js/underscore-min',
    backbone: 'assets/js/backbone-min',
    jcrop: 'assets/js/jcrop'
  }

});

// Chargement du fichier principale de l'app (app.js) et lancemement de l'initialisation
define([
  'src/app'
], function(app){
    
     app.init();
     
     
     
     /*var MyPlugin = app;
     return MyPlugin;*/
    
    
});
