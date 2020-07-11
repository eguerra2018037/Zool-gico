'use strict'

var User = require('../models/user.model');
//Bcrypt encriptar contraseñas
var bcrypt = require('bcrypt-nodejs');
//jwt
var jwt = require('../services/jwt');
//Admnistración de archivos en el servidor (Eliminar archivos, etc)
var fs = require('fs');
//Manejo de rutas en el servidor (Buscar en rutas fisicas)
var path = require('path');

function saveUser(req, res) {
    var user = new User();
    var params = req.body;

    if (params.name &&
        params.username &&
        params.email &&
        params.password) {
        User.findOne({ $or: [{ username: params.username }, { email: params.email }] }, (err, userFind) => {
            if (err) {
                res.status(500).send({ message: 'Error general, intentelo mas tarde' })
            } else if (userFind) {
                res.send({ message: 'usuario o correo ya utilizado' });
            } else {
                user.name = params.name;
                user.username = params.username;
                user.email = params.email;
                user.role = 'USER';
                user.animals = params.animals;

                bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                    if (err) {
                        res.status(500).send({ message: 'Error al encriptar contraseña' });
                    } else if (passwordHash) {
                        user.password = passwordHash;

                        user.save((err, userSaved) => {
                            if (err) {
                                res.status(500).send({ message: 'Error general al guardar usuario' });
                            } else if (userSaved) {
                                res.send({ message: 'Usuario creado', user: userSaved });
                            } else {
                                res.status(404).send({ message: 'Usuario no guardado' });
                            }
                        });
                    } else {
                        res.status(418).send({ message: 'Error inesperado' });
                    }
                });
            }
        });
    } else {
        res.send({ message: 'Ingresa todos los datos' });
    }
}

function login(req, res) {
    var params = req.body;

    if (params.username || params.email) {
        if (params.password) {
            User.findOne({
                $or: [{ username: params.username },
                { email: params.email }]
            }, (err, check) => {
                if (err) {
                    res.status(500).send({ message: 'Error general' });
                } else if (check) {
                    bcrypt.compare(params.password, check.password, (err, passworOk) => {
                        if (err) {
                            res.status(500).send({ message: 'Error al comparar' });
                        } else if (passworOk) {
                            if (params.gettoken = true) {
                                res.send({ token: jwt.createToken(check) });
                            } else {
                                res.send({ message: 'Bienvenido', user: check });
                            }
                        } else {
                            res.send({ message: 'Contraseña incorrecta' });
                        }
                    });
                } else {
                    res.send({ message: 'Datos de usuario incorrectos' });
                }
            });
        } else {
            res.send({ message: 'Ingresa tu contraseña' });
        }
    } else {
        res.send({ message: 'Ingresa tu correo o tu username' });
    }
}

function pruebaMiddleware(req, res) {
    res.send({ message: 'Prueba de middleware correcta' });
}

function updateUser(req, res) {
    var userId = req.params.id;
    var update = req.body;

    if (userId != req.user.sub) {
        res.status(403).send({ message: 'Error de permisos para esta ruta' });
    } else {
        User.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdated) => {
            if (err) {
                res.status(500).send({ message: 'Error general al actualizar usuario' });
            } else if (userUpdated) {
                res.send({ user: userUpdated });
            } else {
                res.status(404).send({ message: 'No se ha podido actualizar el usuario' });
            }
        });
    }
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var fileName = 'No subido';

    if (userId != req.user.sub) {
        res.status(403).send({ message: 'Error de permisos para esta ruta' });
    } else {
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
                User.findByIdAndUpdate(userId,
                    { image: fileName },
                    { new: true },
                    (err, userUpdated) => {
                        if (err) {
                            res.status(500).send({ message: ' Error general al actualizar' });
                        } else if (userUpdated) {
                            res.send({ user: userUpdated, image: userUpdated.image });
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
}

function getImage(req, res) {
    var userId = req.params.id;
    var fileName = req.params.image;
    var pathFile = './uploads/users/' + fileName;

    fs.exists(pathFile, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(pathFile));
        } else {
            res.status(404).send({ message: 'Imagen inexistente' });
        }
    });
}

function listUsers(req, res) {
    User.find({}, (err, users) => {
        if (err) {
            res.status(418).send({ message: 'Error general en la busqueda' });
        } else if (users) {
            res.send({ users });
        } else {
            res.status(418).send({ message: 'Sin datos que mostrar' });
        }
    }).populate('animals');
}

function deleteLoggedUser(req, res) {
    var userId = req.params.id;

    if (userId == req.user.sub) {
        User.findByIdAndDelete(userId, (err, userDeleted) => {
            if (err) {
                res.status(500).send({ message: 'Error general en el servidor', err });
            } else if (userDeleted) {
                res.send({ Delete: 'El usuario ha sido eliminado con éxito.' })
            } else {
                res.status(418).send({ message: 'No ha sido posible eliminar el usuario.' })
            }
        })
    } else {
        res.status(400).send({ message: 'Acción no autorizada (El id es incorrecto)' });
    }
}

module.exports = {
    saveUser,
    login,
    pruebaMiddleware,
    updateUser,
    uploadImage,
    getImage,
    listUsers,
    deleteLoggedUser
}