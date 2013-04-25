/*
 * LES MODELES/COLLECTIONS CONCERNANT LE CROP DE MINIATURES
 */

// Model ThumbnailCropper
// @param id : doit être unique
// @param coord : initialisé au début, il change quand le user recadre l'image
// @param url : url de l'image qui sera crop
// @param size : taille de la miniature à générer
app.Models.ThumbnailCropper = Backbone.Model.extend({

        defaults:{
                id: "",
                coord : "",
                url : "",
                size : "",
                type : "",
                img_size : ""
        },

        initialize: function(){

                this.set("id", this.cid);

                //this.set('coord', [ 0, 0, this.get('size')[0], this.get('size')[1]]);
                w = this.get('size')[0];
                h = this.get('size')[1];
                ratio = (w / h >= 1) ? "horizontal" : "vertical";


                if(ratio == "horizontal"){


                        initW = this.get('img_size')[0];
                        initH = initW * (h / w);

                        initX = 0;
                        initY = this.get('img_size')[1] / 2 - initH /2;
                }
                else
                {
                        initH = this.get('img_size')[1];
                        initW = initH * (w / h);
                        initX = this.get('img_size')[0] / 2 - initW /2;
                        initY = 0;
                }


                this.set('coord', {
                                x : initX,
                                y : initY,
                                w : initW,
                                h : initH,
                                x2 : initX + initW,
                                y2 : initY + initH
                });


        }

})

// Declaration de la collection de cropper
app.Collections.ThumbnailCroppers = Backbone.Collection.extend({
            //model: app.Models.ThumbnailCropper
    
});