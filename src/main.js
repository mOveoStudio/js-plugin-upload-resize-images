require.config({
  shim: {
    underscore: {
      exports: '_'
    },
    jquery: {
      exports: '$'
    },
    backbone: {
      deps: ['underscore', 'jquery'],
      exports: 'Backbone'
    }
  },
  paths: {
    jquery: '../assets/js/jquery-min',
    underscore: '../assets/js/underscore-min',
    backbone: '../assets/js/backbone-min'
  }

});

require([
  'app'
], function(App){
  App.initialize();
});