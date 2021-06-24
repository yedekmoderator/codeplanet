const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');

const { ensureAuthenticated } = require('../lib');

const testUser = {
  username: 'bob',
  password: '12345',
  firstName: 'Bob',
  favoriteNumber: 42,
};

// Start a test server with Passport configuration and routes
module.exports = () => new Promise((resolve, reject) => {
  try {
    const app = express();

    // Resolve with test user without checks for test
    passport.use(new LocalStrategy((username, password, cb) => {
      cb(null, testUser);
    }));

    passport.serializeUser((user, cb) => {
      cb(null, user.username);
    });

    // Resolve with test user without checks for test
    passport.deserializeUser((username, cb) => {
      cb(null, testUser);
    });

    app.use(cookieParser()); // Add cookieParser for user serialization from cookie
    app.use(bodyParser.json()); // The json bodyParser is added the set JSON data in req.body
    app.use(session({ secret: 'mandatory', resave: false, saveUninitialized: false })); // Add sessions

    app.use(passport.initialize()); // Initialize passport
    app.use(passport.session()); // Add session to passport

    // Login API
    app.post('/api/login', (req, res, next) => {
      passport.authenticate('local', (authenticationError, user, info) => {
        if (authenticationError) {
          res.status(500);
          res.json({ error: authenticationError });
        } else if (info) {
          res.status(400);
          res.json({ error: info });
        } else {
          req.logIn(user, (loginError) => {
            if (loginError) {
              res.status(401);
              res.json({ error: loginError });
            } else {
              res.status(200);
              res.json(user);
            }
          });
        }
      })(req, res, next);
    });

    // Dummy route which can only be accessed when authenticated
    app.get('/api/whoami', ensureAuthenticated(), (req, res) => {
      res.status(200);
      res.json({ authenticationRequired: true });
    });

    // End session
    app.post('/api/logout', ensureAuthenticated(), (req, res) => {
      req.logout();
      res.json({ logout: true });
    });

    // Add unless router for testing
    const unlessRouter = express.Router();
    unlessRouter.use(ensureAuthenticated().unless({ path: ['/api/unless/login'] }));

    unlessRouter.get('/whoami', (req, res) => {
      res.status(200);
      res.json({ authenticationRequired: true });
    });

    unlessRouter.get('/login', (req, res) => {
      res.status(200);
      res.json({ authenticationRequired: false });
    });

    app.use('/api/unless/', unlessRouter);

    // Add custom options router for testing
    const customOptionsRouter = express.Router();
    customOptionsRouter.use(ensureAuthenticated({
      statusCode: 418,
      message: 'I\'m a teapot!',
    }));

    customOptionsRouter.get('/authenticated', (req, res) => {
      res.status(200);
      res.json({ authenticationRequired: true });
    });

    app.use('/api/custom-options/', customOptionsRouter);

    // Start server
    const server = app.listen(3000, () => {
      resolve(server);
    });
  } catch (error) {
    reject(error);
  }
});
