

define([
  'jquery',
  'underscore',
  'backbone',
  'src/models/main'
], function($, _, Backbone, Main){
    
  
  
  var init = function (arr) {
      
    //Initialisation du model principal
    main = new Main(arr);

    
    
};
 return {
    init :  init
}

})
