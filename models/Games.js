const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    name : {type : String , required : true},
    email : {type : String , required : true },
    games : {
            playerName : {type : String, },
            playerEmail : {type : String,},
            game : {type:[String]},
            created : {type : Date , default : Date.now}
           }
    ,
    created : {type : Date , default : Date.now}
});
 const Game = mongoose.model('game',UserSchema );
 module.exports = Game;
