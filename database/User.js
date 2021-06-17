const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport-local");
const findOrCreate = require("mongoose-findorcreate");
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
  token: String,
  avatar: {
    type: String
  },
  socketId: String,
  status: {
    type: String,
    default: "Onlayndır."
  },
  vip: {
    type: Boolean,
    default: false
  },
    username : {
    type: String
  },
  friends: Array,
  mails: Array
});

UserSchema.plugin(findOrCreate);

UserSchema.methods.validPassword = function(pwd) {
  // EXAMPLE CODE!
  return this.password === pwd;
};

const User = mongoose.model("User", UserSchema);
module.exports = {
  User: User,
  forpass: UserSchema
};