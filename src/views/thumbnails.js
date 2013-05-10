/*
 * LES VUES CONCERNANT LE CROP DE MINIATURES
 */

define([
  'underscore',
  'backbone',
  'jquery',
  'src/templates/templates',
  'jcrop'
], function(_, Backbone, $, JST) {
        // Vue de la collection de recadreurs d'image
        ThumbnailCroppersView = Backbone.View.extend({

                urlImage : "",
                countReturn : 0,

                initialize: function(){


                        this.templateThumbnailsList = JST['template/thumbnailsList'];
                        this.templateCropZone = JST['template/thumbnailCropZone'];

                        this._meta = {

                                currentModel : null,
                                countReturn : 0

                        };
                        _.bindAll(this,"onCropSelect","applyJCrop","clickOnGenerateButton");

                },

                meta: function(prop, value) {
                        if (value === undefined) {
                                return this._meta[prop]
                        } else {
                                this._meta[prop] = value;
                        }
                },

                events : {
                        'click #nav-image-size a' : "changeTumbnail",
                        'click #generate-image' : "clickOnGenerateButton"
                },

                clickOnGenerateButton : function (e){
                    this.trigger("endThumbnailsSelection");
                    e.preventDefault();
                },

                // Affichage du module de thumbnail
                render : function() {
                        tmbnls = this.collection;
                        
                        var renderedContent = this.templateThumbnailsList({ thumbnails : this.collection.toJSON() });

                        $(this.el).find("#nav-image-size").html(renderedContent);

                        $(this.el).find("#cropped-container").html(this.templateCropZone({url : this.meta("imgURL")}));

                        this.meta('currentModel', this.collection.models[0]);

                        this.countReturn = 0;
                        this.urlImage = this.meta("imgURL");

                        setTimeout(this.applyJCrop,200);

                        return this;
                },

                clean: function(){

                    this.collection.reset();
                    $(this.el).find("#nav-image-size").html("");
                    $(this.el).find("#cropped-container").html("");

                },


                // Applique le plugin jCrop au visuel principal apres 200ms
                applyJCrop : function(){
                        var _this = this;
                        jcrop = $(this.el).find('#target').Jcrop({

                                bgOpacity: 0.3,
                                allowSelect: false,
                                bgColor: '#212121',
                                addClass: 'jcrop-light model-',
                                aspectRatio: this.meta('currentModel').get('size')[0] / this.meta('currentModel').get('size')[1],
                                setSelect:   [ this.meta('currentModel').get('coord').x, this.meta('currentModel').get('coord').y, this.meta('currentModel').get('coord').x2, this.meta('currentModel').get('coord').y2],
                                trueSize: [this.meta("imgSize")[0],this.meta("imgSize")[1]],
                                boxWidth: 500,
                                boxHeight: 400,
                                onSelect: this.onCropSelect


                        },function(){
                                _this.meta('jcropAPI',this); 
                                $(this.ui.holder).css("margin-left", (500 - $(this.ui.holder).width()) / 2 + "px");
                                $(this.ui.holder).css("margin-top", (400 - $(this.ui.holder).height()) / 2 + "px");
                        });


                },

                // Chaque fois que la selection change on met a jour les coordonnees du model en cours
                onCropSelect: function(e){
                    this.meta('currentModel').set('coord',e);
                },

                // Applique un nouveau jCrop de la taille de la miniature voulue
                changeTumbnail : function(e) {

                        destURL = $(e.target).attr('href').replace('#','');
                        this.meta('currentModel', this.collection.get(destURL));

                        currentCoord = this.meta('currentModel').get('coord');
                        currentSize = this.meta('currentModel').get('size');

                        this.meta('jcropAPI').setOptions({aspectRatio: currentSize[0]/currentSize[1]});
                        this.meta('jcropAPI').setSelect([currentCoord.x, currentCoord.y, currentCoord.x2, currentCoord.y2]);

                        $("#nav-image-size li").removeClass('active');
                        $(e.target).parent().addClass('active');
                        e.preventDefault();

                }


        });
        
        return ThumbnailCroppersView;
});
