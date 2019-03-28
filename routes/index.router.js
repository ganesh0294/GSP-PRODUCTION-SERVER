const express = require('express');
var multer = require('multer');
var awsS3 = require('aws-sdk');
const router = express.Router();
var Emp = require('../models/employee.model');
const ctrlUser = require('../controllers/user.controller');

const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
// router.post('/authenticate', ctrlUser.authenticate);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/login', ctrlUser.login);
router.post('/userProfile', ctrlUser.userProfile);
router.post('/superadmin', ctrlUser.superadmin);
router.post('/changeUserPassword', ctrlUser.changeUserPassword);
router.post('/confirmpayment',ctrlUser.confirmPayment);

router.post('/upload',function(req,res){
//router.get('/userslist', ctrlUser.userslist);
//let Data = [];
 for(var i=0; i<req.body.length; i++){
     //Data.push(req.body[i]);
     let newEmp = new Emp({
        firstname :req.body[i].firstName,
        lastname : req.body[i].lastName
    });
    newEmp.save();
 }
       res.json("your data is saved"); 
});

router.post('/userForgotPassword', ctrlUser.userForgotPassword);





router.post('/videos', function(req,res){
    
})



//router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);

module.exports = router;