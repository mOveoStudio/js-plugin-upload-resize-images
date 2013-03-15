(function($) {

    window.Image = Backbone.Model.extend({
		
		defaults:{
			id: "",
			title : "",
			url : ""
		
		},
		
		
		initialize : function Doc(){

			console.log("Doc Constructor");
			
			
			this.bind("error", function(model, error){
				console.log( error );
			});
		}
		
		
	})
	
	
	window.Images = Backbone.Collection.extend({
			model: Image,
			
			//localStorage : new Store("mvo_images"),
			
			initialize : function() {
				console.log('Docs collection constructor');
			}
	})
	
	window.ImageView = Backbone.View.extend({
		el : $('#doc-container-template'),
		initialize: function(){
			
			console.log("Test d'initialisation de vue ");
		
		},
		
		render: function(){
		
			var urlModel = this.model.get('url');
			var idModel = this.model.get('id');
			var obj = $("<li class=\"span3\" id=\""+ idModel + "\" attr-id=\""+ idModel + "\"><img src='" + urlModel + "' class=\"\"/></li>")//.draggable();
			$(this.el).append(obj);
			
			// sert juste a chainer....
			return this;
		
		}
	
	})
	
	
	window.ImagesCollectionView = Backbone.View.extend({
		el : $('#doc-container-template'),
		initialize: function(){
			this.template = _.template($("#docs-collection-template").html());
			
			/*--- binding ---*/
            _.bindAll(this, 'render');
            this.collection.bind('change', this.render);
            this.collection.bind('add', this.render);
            this.collection.bind('remove', this.render);
            /*---------------*/
			
			
		},
		
		render : function() {
			var renderedContent = this.template({ images : this.collection.toJSON()});

			$(this.el).html(renderedContent);
			return this;
		}
	})
	
	
	
	window.DocsRouter = Backbone.Router.extend({

        initialize : function() {
			this.images = new Images();
			this.img1 = new Image({id:"250", url:"img/01.jpg"});
			this.img2 = new Image({id:"630", url:"img/02.jpg"});
			this.img3 = new Image({id:"150", url:"img/03.jpg"});
			this.img4 = new Image({id:"900", url:"img/04.jpg"});
			this.images.add([this.img1, this.img2, this.img3, this.img4]);
			
			this.view = new ImagesCollectionView({collection : this.images});
			this.view.render();

        },
		
		routes : {
			"" : "root",
			"about" : "about",
			"doc/:id" : "doc"
		},
		
		about : function (){ console.log("C'est about....")},
		root : function() { console.log("Ca c'est l'accueil")},
		doc : function (id) { console.log(id, this.docs.get(id).toJSON()); }

    });
	
	
	/*--- initialisation du router ---*/
	router = new DocsRouter();

	/*---
	activation du monitoring des "hashchange events"
	et dispatch des routes
	---*/
	Backbone.history.start();
	
	$( "#doc-container" ).sortable({
			revert:100,
			stop: function(ev, ui) {
				arr = $(this).sortable('toArray', 'attr-id');
				console.log(arr);
			}
	});
	$( "#doc-container" ).disableSelection();
	
	$('#target').Jcrop({
      // start off with jcrop-light class
      bgOpacity: 0.3,
      bgColor: '#212121',
      addClass: 'jcrop-light',
	  aspectRatio: 300 / 500,
	  onSelect: updateCoords
    },function(){
      api = this;
      api.setSelect([0,0,300,500]);
      api.ui.selection.addClass('jcrop-selection');
    });
	
	console.log($('#target'));
	coord = null;
	
	function getCoords(){
		if(coord == null) return {x : 0, y : 0, h:25, w:52, src: $('#target').attr('src')}
		else 
		return coord;
	}
	
	function updateCoords(c){
		coord = c;
	}
	
	$("#generate-image").click(function(e){
	
		coord = getCoords();
		$.ajax({
			type: "POST",
			url : "js/crop.php",
			data : {x : coord.x, y : coord.y, h:coord.h, w:coord.w, src: $('#target').attr('src')},
			success : function(d){
			console.log($(e.target));
				$(e.target).parents(".modal").modal('hide');
			}
		
		})
		return false;
		e.preventDefault();
	})
	
	//$(".test").draggable();
	
	
})(jQuery);
