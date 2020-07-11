'use strict'

var express = require('express');
var animalController = require('../controllers/animal.controller');
var api = express.Router();
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');//manejo de archivos en la solicitud
var mdUpload = connectMultiparty({ uploadDir: './uploads/animals'});


api.post('/saveAnimal', mdAuth.ensureAuthAdmin,animalController.saveAnimal);
api.put('/updateAnimal/:id',mdAuth.ensureAuthAdmin,animalController.updateAnimal);
api.delete('/deleteAnimal/:id', mdAuth.ensureAuthAdmin,animalController.deleteAnimal);
api.put('/uploadImage/:id',[mdAuth.ensureAuthAdmin, mdUpload],animalController.uploadImage);
api.get('/getImage/:id',[mdAuth.ensureAuthAdmin, mdUpload],animalController.getImage);
api.get('/listAnimals',mdAuth.ensureAuth, animalController.listAnimals);
api.get('/listAnimalById/:id',mdAuth.ensureAuth,animalController.listAnimalById);

module.exports = api;