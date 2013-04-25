/*
 * LES VUES CONCERNANT L'AFFICHAGE DES IMAGES ET LEUR TRI
 */

// Vue de la Collection de Model Image
app.Views.ImagesView = Backbone.View.extend({
        el : $(),
        initialize: function(){
            
                this.el = app.views.main.imagesModuleHTML;

                this.template = app.JST['template/imagesCollection'];

                // A chaque modif/ajout/suppr de la collection Images on lance le render
                _.bindAll(this, 'render', 'changeOrderArray');
                this.collection.bind('change', this.render);
                this.collection.bind('add', this.render);
                this.collection.bind('remove', this.render);
   

        },

        render : function() {
            
                var renderedContent = this.template({ images : this.collection.toJSON()});
                
                $(this.el).html(renderedContent);
                
                // Applique le plugin de Drag&Drop de jQueryUI
                $(this.el).find('#images-container').sortable({
                        revert:100,
                        stop: this.changeOrderArray
                });
                
                return this;
        },
        
        // Methode lancee chaque fois que l'ordre des images est modifiee
        changeOrderArray : function(ev, ui){
                arr = $(this.el).find('#images-container').sortable('toArray', 'attr-id');
                this.trigger("sortImages", arr);
        }
});