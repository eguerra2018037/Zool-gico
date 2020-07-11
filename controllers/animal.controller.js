'use strict'

var Animal = require('../models/animal.model');
var fs=require('fs');
var path =require('path');

function saveAnimal(req, res) {
    var animal = new Animal();
    var params = req.body;

    if (params.name && params.nickName && params.age) {
        Animal.findOne({ name: params.name, nickName: params.nickName }, (err, finded) => {
            if (err) {
                res.status(500).send({ error: 'Error general en el servidor.', err });
            } else if (finded) {
                res.send({ message: 'Ya existe un animal con estas caracterìsticas.' });
            } else {
                animal.name = params.name;
                animal.nickName = params.nickName;
                animal.age = params.age;
                animal.image = params.image;

                animal.save((err, animalSaved) => {
                    if (err) {
                        res.status(500).send({ error: 'Error general en el servidor.', err });
                    } else if (animalSaved) {
                        res.send({ 'Guardado con éxito': animalSaved });
                    } else {
                        res.status(400).send({ message: 'No ha sido posible guardar.' });
                    }
                });
            }

        });
    } else {
        res.status(202).send({ message: 'Debe ingresar todos los datos requeridos' });
    }
}

function updateAnimal(req, res) {
    var animalId = req.params.id;
    var actualizar = req.body;

    Animal.findByIdAndUpdate(animalId, actualizar, (err, animalUpdated) => {
        if (err) {
            res.status(500).send({ error: 'Error general en el servidor.', err });
        } else if (animalUpdated) {
            res.send({ 'Animal actualizado': animalUpdated });
        } else {
            res.status(400).send({ message: 'No ha sido posible actualizar.' });
        }
    });
}

function deleteAnimal(req, res) {
    var animalId = req.params.id;

    Animal.findByIdAndDelete(animalId, (err, deletedAnimal) => {
        if (err) {
            res.status(500).send({ error: 'Error general en el servidor.', err });
        } else if (deletedAnimal) {
            res.send({ deleted: 'Registro eliminado.' });
        } else {
            res.status(400).send({ message: 'No ha sido posible eliminar el registro.' });
        }
    });
}

function uploadImage(req, res) {
    var animalId = req.params.id;
    var fileName = 'No subido';

    if (req.files) {
        var filePath = req.files.image.path;
        var fileSplit = filePath.split('\\');
        var fileName = fileSplit[2];

        var ext = fileName.split('\.');
        var fileExt = ext[1];

        if (fileExt == 'png' ||
            fileExt == 'jpg' ||
            fileExt == 'jpeg' ||
            fileExt == 'gif') {
            Animal.findByIdAndUpdate(animalId,
                { image: fileName },
                { new: true },
                (err, animalUpdated) => {
                    if (err) {
                        res.status(500).send({ err: ' Error general al actualizar',err });
                    } else if (animalUpdated) {
                        res.send({ animal: animalUpdated, image: animalUpdated.image });
                    } else {
                        res.status(418).send({ message: 'No se ha podido actualizar' });
                    }
                });
        } else {
            fs.unlink(filePath, (err) => {
                if (err) {
                    res.status(418).send({ message: 'Extensión de archivo no admitida, y archivo no eliminado' });
                } else {
                    res.send({ message: 'Extensión de archivo no admitida' });
                }
            });
        }
    } else {
        res.status(404).send({ message: 'No has subido una imagen' });
    }
}

function getImage(req, res) {
    var animalId = req.params.id;
    var fileName = req.params.image;
    var pathFile = './uploads/animals/' + fileName;

    fs.exists(pathFile, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(404).send({ message: 'Imagen inexistente' });
        }
    });
}

function listAnimals(req,res){
    Animal.find({},(err,finded)=>{
        if(err){
            res.status(500).send({error:'Error general en el servidor.',err});
        }else if(finded){
            res.send({animals:finded});
        }else{
            res.status(404).send({message:'No hay datos para mostrar.'});
        }
    });
}

function listAnimalById(req,res){
    var animalId=req.params.id;

    Animal.findById(animalId,(err,finded)=>{
        if(err){
            res.status(500).send({error:'Error general en el servidor.',err});
        }else if(finded){
            res.send({animal:finded});
        }else{
            res.status(404).send({message:'No se encontraron registros.'});
        }
    });
}

module.exports = {
    saveAnimal,
    updateAnimal,
    deleteAnimal,
    uploadImage,
    getImage,
    listAnimals,
    listAnimalById
}