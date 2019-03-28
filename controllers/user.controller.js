const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const _ = require('lodash');
const csv2json = require('csv2json');
var multer = require('multer');

const User = mongoose.model('User');
//const employee = mongoose.model('Employee');
const nodemailer = require('nodemailer');

// let Stripe = require('../models/Stripe');
var stripe = require("stripe")("sk_test_ICkfCHBoNuYZh7vpPdJlngsr00f9QHOY9s");
//const stripe = require("stripe")("sk_test_mU48LRBgjjYjTfeE1UQXD7cT");

const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "gsptesting007@gmail.com",
        pass: "ganesh@123"
    }
});
let mailOptions, host, link;

module.exports.register = (req, res, next) => {
    console.log("getSuperAdminProfile user : ", req.body);

    var user = new User();
    user.fullName = req.body.fullName;
    user.email = req.body.email;
    user.password = req.body.password;
    user.position = req.body.position;
    user.department = req.body.department;
    user.mobile = req.body.mobile;
    user.save((err, doc) => {
        if (!err){
            console.log("getSuperAdminProfile doc : ", doc);

            res.send(doc);}
        else {
            if (err.code == 11000)
                res.status(422).send(['Duplicate email adrress found.']);
            else{
            console.log("getSuperAdminProfile err : ", err);
                return next(err);}
        }

    });
}

module.exports.authenticate = (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => { 
        if (err) return res.status(400).json(err);
        // registered user
        else if (user) return res.status(200).json({ "token": user.generateJwt(),'data':user});
        // unknown user or wrong password
        else return res.status(404).json(info);
    })(req, res, next);
}


module.exports.login = (req, res, next) => {
    // call for passport authentication
    passport.use(new LocalStrategy({
        usernameField: 'user[email]',
        passwordField: 'user[password]'
    }, 
        function (email, password, cb) {
            //this one is typically a DB call. Assume that the returned user object is pre-formatted and ready for storing in JWT
            return User.findOne({ email, password})
                .then(user => {
                    console.log("init login user : " + JSON.stringify(user));
                    if (!user) {
                        return cb(null, false, {message: 'Incorrect email or password.'});
                    }
                    return cb(null, user, {message: 'Logged In Successfully'});
                })
                .catch(err => cb(err));
        }
    ));
}

module.exports.userProfile = (req, res, next) =>{
    let userId = req.body.user_id;
    User.findOne({ _id: userId},
        (err, user) => {
            if (!user){
                return res.status(404).json({ status: false, message: 'User record not found.' });
            }else{ 
                return res.status(200).json({ status: true, user : _.pick(user,['_id','fullName','email','department','position','mobile']) });
            }

        }
    );
}

module.exports.userslist = (req,res,next)=> {
    db.getCollection('users').find({},
        (err, userDetail) => {
            if (!userDetail){
                return res.status(404).json({ status: false, message: 'User record not found.' });
            }else{ 
                return res.status(200).json({ status: true, userDetail : userDetail});

            }
        }
    );
}
module.exports.superadmin = (req,res,next)=> {
    var user_id = req.body.id;
    var data = req.body.data;
    User.update({_id:user_id}, {$set: data},
        (err, doc) => {
            if (!err){
                if(doc.nModified >=1){
                    res.status(200).json({ status: true, message: 'Update profile success!' });
                }
            }else {
                if (err.code == 11000)
                    res.status(422).send(['Duplicate email adrress found.']);
                else
                    return next(err);
            }
        });
}


module.exports.userForgotPassword = (req,res,next)=> {
    User.findOne({ email: req.body.email},
        (err, user) => {
            if (!user){
                return res.status(404).json({ status: false, message: 'User record not found.' });
            }else{ 
                let rand1 = Math.floor((Math.random() * 7833556) + 545);
                User.findByIdAndUpdate({_id: user._id}, {
                    $set: {saltSecret: rand1}
                },{new : true}).then(
                    user => {
                        link = `http://localhost:4200/userForgotPassword?id=${user.saltSecret}&email=${user.email}`;
                        mailOptions = {
                            to: user.email,
                            subject: "PASSWORD HELP HERE..........",
                            html: "Hello,<br> Please Click on the link to change your password.<br><a href=" + link + ">Click here to verify its you</a>"
                        }
                        smtpTransport.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                res.send("error");
                            } else {
                                res.status(200).json({ status: true, message: 'Mail sent success!' });
                            }
                        });
                    },
                    err => {
                        return res.status(404).json({
                            error: "your details not match"
                        });
                    }
                );
            }
        }
    );  
}

module.exports.changeUserPassword = async (req,res,next)=> {
    var newUserPassword = req.body.newPassword;
    const salt = bcrypt.genSaltSync(10);
    let encPass = bcrypt.hashSync(newUserPassword, salt);
    var passdata = {
        password : encPass
    }
    let user = await User.updateOne({email : req.body.email , saltSecret : req.body.saltSecret}, {$set : passdata});
    try {
        if(user.nModified >= 1){
            res.status(200).json({ status: true, message: 'Password change success!' });
        }
        else {
            console.error("some error", user)
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
          "error" : error,
          "msg" : "SOme error at backend"
        })
    }
}

exports.confirmPayment = async (req,res)=>{
    const token = req.body.id;

     stripe.charges.create({
        amount: 999,
        currency: 'usd',
        description: 'Example charge',
        source: token,
        capture: false,
      })
      .then(resx =>{
          console.log(resx,' : asd payment data');

          return res.status(200).json({ success : 'Payment done' });
      }).catch(err =>{
          console.error(err);
        res.status(500).json({'errror': err});
      })
    //   const charge = await stripe.Charges.capture('ch_KEWhCKgCx7UIAe0wbqIa')
      
}




