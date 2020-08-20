'use strict'

const express = require('express');

const controller = require('../controllers/article');


const router = express.Router();

const multipart = require('connect-multiparty');

const md_upload = multipart({ uploadDir: './upload/articles' })

router.post('/save', controller.save);
router.get('/articles/:last?', controller.getArticles); // el ? hace que no sea obligatorio agregarle un parámetro
router.get('/article/:id', controller.getArticle);
router.put('/article/:id', controller.updated);
router.delete('/article/:id', controller.delete);
router.post('/upload-image/:id', md_upload, controller.upload);
router.get('/get-image/:image', controller.getImage);
router.get('/search/:search', controller.search);



module.exports = router;