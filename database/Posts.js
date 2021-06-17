const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title : String,
  description : String,
  date : Date,
  short_description : String,
  author : String,
  category : String,
  avatar : String,
  user_id : String,
  comments : {
    data : String,
    comment_author : String
  }
})

const Posts = mongoose.model("Posts", PostSchema);

module.exports = Posts;