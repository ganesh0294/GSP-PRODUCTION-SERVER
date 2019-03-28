const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var employeeSchema = new mongoose.Schema({
    firstname:String,
    lastname:String,
    email:String
    
});


module.exports = mongoose.model('Employee', employeeSchema);
//mongoose.model('Employee', employeeSchema);