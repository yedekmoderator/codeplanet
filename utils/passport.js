const LocalStrategy = require("passport-local").Strategy;
const User = require("../database/User.js").User;


module.exports = function(passport){
  passport.use(
  new LocalStrategy(
    {
      email: "email",
      password: "password",
      passReqToCallback: true
    },
    function(req, email, password, done) {
      User.findOne({ email: email }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      });
    }
  )
  );
}