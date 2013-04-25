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
    jquery: '../assets/js/jquery-min',
    jqueryUI: '../assets/js/jquery-ui',
    text:'../assets/js/text',
    underscore: '../assets/js/underscore-min',
    backbone: '../assets/js/backbone-min',
    jcrop: '../assets/js/jcrop'
  }

});

require([
  'app'
], function(App){
  App.init();
});