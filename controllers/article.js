'use strict'

const validator = require('validator');
const Article = require('../models/articles');
const fs = require('fs');
const path = require('path');
const {
    exists
} = require('../models/articles');

const controller = {
    save: (req, res) => {
        const params = req.body;
        console.log(params);

        let validate_title;
        let validate_content;

        // validar datos
        try {
            validateTitle = !validator.isEmpty(params.title);
            validateContent = !validator.isEmpty(params.content);

            const article = new Article();

            article.title = params.title;
            article.content = params.content;
            article.image = null;

            article.save((error, articleStored) => {
                console.log(articleStored);
                if (error || !articleStored) {
                    return res.status(401).json({
                        status: 'error',
                        message: 'El artículo no se ha guardado'
                    });
                }
                return res.status(201).json({
                    status: 'success',
                    message: 'articulo guardado correctamente',
                    article: articleStored
                })
            })


        } catch (error) {
            return res.status(401).json({
                status: 'error',
                message: 'Faltan datos'
            });
        }

        if (validate_title && validate_content) {
            return res.status(201).json({
                status: 'success',
                message: 'actualizado'
            });
        } else {
            return res.status(500).json({
                status: 'error',
                message: 'Error al actualizar el artículo'
            });
        }
    },
    getArticles: (req, res) => {

        let query = Article.find({});

        let last = req.params.last;

        if (last || last != undefined) {
            query.limit(5);
        }

        query.sort('-_id').exec((error, articles) => {

            if (error) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Error al devolver los artículos'
                });
            }
            if (!articles) {
                return res.status(403).json({
                    status: 'error',
                    message: 'No existen artículos'
                });
            }

            return res.status(200).json({
                status: 'success',
                article: articles
            });
        });

    },

    getArticle: (req, res) => {

        let articleId = req.params.id;

        if (!articleId || articleId == null) {
            return res.status(404).json({
                status: 'error',
                message: 'No existe artículo'
            });
        }

        Article.findById(articleId, (error, article) => {
            if (error || !article) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Error al devolver el artículo'
                });
            }

            return res.status(201).json({
                status: 'success',
                article: article
            });
        });

    },

    updated: (req, res) => {

        let articleId = req.params.id;

        let params = req.body;

        let validate_title;
        let validate_content;

        try {
            validate_title = !validator.isEmpty(params.title);
            validate_content = !validator.isEmpty(params.content);

        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: 'Error al actualizar el artículo'
            });
        }

        if (validate_title && validate_content) {

            Article.findOneAndUpdate({
                _id: articleId
            }, params, {
                new: true
            }, (error, articleUpdated) => {
                if (error || !articleUpdated) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Error al actualizar el artículo'
                    });
                }
                return res.status(200).json({
                    status: 'success',
                    article: articleUpdated
                });

            });

        } else {
            return res.status(500).json({
                status: 'error',
                message: 'Error al actualizar el artículo'
            });
        }
    },

    delete: (req, res) => {
        const articleId = req.params.id;

        Article.findOneAndDelete({
            _id: articleId
        }, (error, articleDelete) => {

            if (error || !articleDelete) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Error al borrar el artículo'
                });
            }
            return res.status(200).send({
                status: 'success',
                article: articleDelete
            });
        });
    },

    upload: (req, res) => {

        // configurar módulo connect multiparty




        // recoger el fichero de la petición

        let fileName = 'Imagen no subida...';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: fileName
            });
        }



        // conseguir el nombre y la extensión
        let file_path = req.files.file0.path;
        let file_split = file_path.split('\\');

        let file_name = file_split[2];
        let extension = file_name.split('\.');
        let file_ext = extension[1];



        // comprobar la extensión

        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'jpeg' && file_ext != 'gif') {

            fs.unlink(file_path, (error) => {
                return res.status(404).send({
                    status: 'error',
                    message: 'La extensión de la imagen no es válida'
                });
            })

        } else {

            let articleId = req.params.id;

            Article.findOneAndUpdate({
                _id: articleId
            }, {
                image: file_name
            }, {
                new: true
            }, (error, articleUpdated) => {

                if (error || !articleUpdated) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'error al guardar el artículo'
                    })
                }

                return res.status(200).json({
                    status: 'success',
                    article: articleUpdated
                });
            });
        }

    },

    getImage: (req, res) => {

        let file = req.params.image;
        let path_file = './upload/articles/' + file;

        fs.exists(path_file, (exists) => {
            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).json({
                    status: 'error',
                    message: 'no se pudo obtener la imagen'
                });
            }
        });
    },

    search: (req, res) =>{

        let searchString = req.params.search;
        Article.find({ '$or': [
            { 'title': { '$regex': searchString, '$options': 'i'}},
            { 'content': { '$regex': searchString, '$options': 'i'}},
        ]})
        .sort([['date', 'descending']])
        .exec((error, article)=>{
            if(error){
                return res.status(403).json({
                    status: 'error',
                    message: 'Hubo un error en la búsqueda'
                });
            } 

            if(!article || article.length <= 0 ){
                return res.status(403).json({
                    status: 'error',
                    message: 'No se encontraron artículos que coincidan con tu búsqueda'
                });
            } 

            return res.status(200).json({
                status: 'success',
                article
    
            });
        })

    }


};

module.exports = controller;