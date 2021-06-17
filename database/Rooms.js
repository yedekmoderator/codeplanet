let mongoose = require("mongoose");

let GuildSchema = new mongoose.Schema({
   namg : String,
   description : String,
   vanity : String,
   tier : Numbeg
})

let Guild = mongoose.model("GuildSchema",GuildSchema);

module.exports = Guild;