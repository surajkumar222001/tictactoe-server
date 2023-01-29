const  express = require('express');
const User = require("../models/User");
const Game = require("../models/Games")
const router = express.Router();
const  {body,validationResult} = require('express-validator');
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const authenticate = require('../middlewares/authenticate');
const { findOne } = require('../models/User');

/*
user Router
Usage : Register a User
URL :http://127.0.0.1:5000/api/user/register
parameters : name ,email,password
methode : post
access : public
*/

router.post('/register' ,[
    body('name').notEmpty().withMessage('name is required'),
    body('username').notEmpty().withMessage('username is required'),
    body('email').notEmpty().withMessage('email is required'),
    body('password').notEmpty().withMessage('password is required')

] ,async (request,response) => {
    let error =validationResult(request)
    if (!error.isEmpty()){
        return response.status(401).json({error : error.array()})
    }
    try{
        let {name,username ,email , password} = request.body;

        // check if user already exists or not
           let user = await User.findOne({email :email });
           if(user){
               return response.status(401).json({error : [{message : 'user is already Exist'}]})
           }

        // encrypt the password
        let salt = await bcrypt.genSalt(10);
           password = await bcrypt.hash(password , salt);


        // save to db

         user = new User({ name, username  ,email ,  password });
         user = await  user.save();


         response.status(200).json({
             message : 'Congratulations!!! Account created',
             user : user
         })

    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    }
});

/*
user Router
Usage : Login a User
URL :http://127.0.0.1:5000/api/user/login
parameters : email,password
methode : post
access : public

*/

router.post('/login' ,  [
    body('username').notEmpty().withMessage('enter username'),
    body('password').notEmpty().withMessage('enter password')
    ],
     async (request,response) => {
         let error = validationResult(request);
         if (!error.isEmpty()){
             return response.status(401).json({error : error.array()})
         }
         try{

        let {username,password} = request.body;
        //check user is exist or not

             let user = await User.findOne({username : username})
             if (!user){
                 return response.status(401).json([{message : 'Enter correct details.'}])
             }

             // check the password
             let isMatch = await bcrypt.compare(password, user.password);
             if (!isMatch){
                 return response.status(401).json([{message : 'Enter correct details.'}])
             }
             // create Jwt Token
             let payload = {
                 userInfo : {
                     id : user.id,
                     name : user.name,
                     email : user.email
                 }
             };

             jwt.sign(payload,process.env.JWT_SECRET_KEY  , (err , token) => {
                 if (err) throw err;
                 return response.status(200).json({
                     msg : 'Login  Successful',
                     token : token,
                     user : user
                 })
             })

    }
    catch (error) {
        console.error(error)
        response.json({
            error : [{message : error.message}]
        })
    }
});


/*
user Router
Usage : Get User
URL :http://127.0.0.1:5000/api/user/
parameters : no filed required
methode : get
access : Private

*/
router.get('/games' ,authenticate,async (request , response) => {

    try {

        let user = await Game.findOne({email : request.user.email});
        response.status(200).json({user : user});

    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            error : [{message : error.message}]
        })
    }
});


// invite friend using email

router.post('/invite',async (request , response) => {

    try {
        let {email} = request.body
        let user = await User.findOne({email : email} , {password : 0 , username : 0});
        if (!user){
            return response.status(404).json([{message : 'User Not Found'}])
        }
        response.status(200).json({user : user});

    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            error : [{message : error.message}]
        })
    }
});


//

router.post('/game/status' ,authenticate,async (request , response) => {

    try {
       let { email , name , game } = request.body
        let player = await User.findOne({email : email})
      // let user = await User.findById(request.user.id);
       let user = {
        name : request.user.name,
        email : request.user.email,
        games :  {
            playerName : player.name,
            playerEmail : email,
            game : game,
           }
       }

       user = new Game(user);
       user = await user.save();
      response.status(200).json({user : user});

    }
    catch(error) {
        console.log(error);
        return response.status(500).json({
            error : [{message : error.message}]
        })
    }
});


module.exports = router



