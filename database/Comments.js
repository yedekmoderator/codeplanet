const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  title : String,
  description : String,
  date : Date,
  author : String
})

const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;