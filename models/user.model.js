'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    role: String,
    image: String,
    animals:  [{ type: Schema.Types.ObjectId, ref: 'animal'}]
});

module.exports = mongoose.model('user', userSchema);