const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport-local");
const findOrCreate = require("mongoose-findorcreate");
const key = require("./authKey.js").url;

const UserSchema = new mongoose.Schema({
  usernames : Array
});

const Banlist = mongoose.model("Banlist", UserSchema);
module.exports = Banlist;