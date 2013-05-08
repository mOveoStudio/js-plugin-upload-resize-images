Plugin Upload and Generate Thumbnails based on Backbone
==============================

Plugin développé avec Backbone pour gérer les miniatures des images uploadées

@TODO
- Séparer le code en 3 modules distincts : UploadManager, ThumbnailManager, SortImageManager
- <del>Utiliser les JST templates pour eviter de dependre d'un html principal</del> (23/04/2013)
- <del>A l'initialisation du plugin creer les $el qui accueilleront les 3 modules : #images-sort-list, #upload, #thumbnailGenerator</del> (23/04/2013)
- <del>Réduire les dépendances au nombreux plugin JS et integrer les plugins indipensables directement dans l'appli (requireJS ?)</del> (08/05/2013)
- <del>Ajouter des methodes evenements lors des actions suivantes : onThumbnailsCreate, onImagesSort,...</del> (08/05/2013)
- Intégrer les css de JCrop et FileUpload dans le styles.css
- Supprimer la dépendance au bootstrap de Twitter
- Rendre compatible avec IE la partie upload
- ....