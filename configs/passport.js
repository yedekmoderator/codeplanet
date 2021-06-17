const LocalStrategy = require("passport-local").Strategy;
const User = require("../database/User.js").TEKHECE;
const schema = require("../database/User.js").forpass;

module.exports = function(passport){
  passport.use(
    new LocalStrategy(
      function(username, password, done){
        User.find({ name : username}).then((user) =>{
          if(!user) return done(null, false)
        return done(null, { name : "Owner"});
        })
      }
    )
    
  );
}