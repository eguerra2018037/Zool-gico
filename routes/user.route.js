'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var api = express.Router();
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');//manejo de archivos en la solicitud
var mdUpload = connectMultiparty({ uploadDir: './uploads/users'});

api.post('/saveUser', userController.saveUser);
api.post('/login', userController.login);
/*¨Para prueba de middleware */

api.get('/pruebaMiddleware', mdAuth.ensureAuth,userController.pruebaMiddleware);
api.put('/updateUser/:id', mdAuth.ensureAuth, userController.updateUser);
api.put('/uploadImage/:id', [mdAuth.ensureAuth, mdUpload], userController.uploadImage);
api.get('/getImage/:id/:image', [mdAuth.ensureAuth, mdUpload], userController.getImage);
api.get('/listUsers',mdAuth.ensureAuthAdmin, userController.listUsers);
api.delete('/deleteLoggedUser/:id', mdAuth.ensureAuth, userController.deleteLoggedUser);

//LISTAR USUARIO (TOKEN ADMIN)
api.get('/listUsers', mdAuth.ensureAuthAdmin, userController.listUsers);

module.exports = api;