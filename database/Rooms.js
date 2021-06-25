let mongoose = require("mongoose");

let GuildSchema = new mongoose.Schema({
   name : String,
   description : String,
   vanity : String,
   tier : Number
})

let Guild = mongoose.model("GuildSchema",GuildSchema);

module.exports = Guild;