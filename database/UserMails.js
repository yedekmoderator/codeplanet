const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const key = require('./authKey.js').url

const UserMails = new mongoose.Schema({
  from : String,
  to : String,
  title : String,
  data : String,
  date : {
    type : Date,
    default : Date.now()
  }
});

const UserMail = mongoose.model("UserMail",UserMails);
module.exports = UserMail;