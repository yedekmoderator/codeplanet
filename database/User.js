const mongoose = require("mongoose");
const passport = require("passport-local");
const key = require("./authKey.js").url;

const UserSchema = new mongoose.Schema({
  username: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now()
  },
  avatar: {
    type: String,
    default : "https://cdn.discordapp.com/attachments/823558223725461524/841740941086031882/1174215797dec302c416c52eaac5fc46.png"
  },
  status: {
    type: String,
    default: "Onlayndır."
  },
  vip: {
    type: Boolean,
    default: false
  },
  friends: Array,
  mails: Array
});


UserSchema.methods.validPassword = function(pwd) {
  // EXAMPLE CODE!
  return this.password === pwd;
};

const User = mongoose.model("User", UserSchema);
module.exports = {
  User: User
};