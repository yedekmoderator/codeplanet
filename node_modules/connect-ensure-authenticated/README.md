# connect-ensure-authenticated

[![NPM version](https://img.shields.io/npm/v/connect-ensure-authenticated.svg)](https://www.npmjs.com/package/connect-ensure-authenticated)
[![Build Status](https://travis-ci.com/allardvanderouw/connect-ensure-authenticated.svg?branch=master)](https://travis-ci.com/allardvanderouw/connect-ensure-authenticated)
[![codecov](https://codecov.io/gh/allardvanderouw/connect-ensure-authenticated/branch/master/graph/badge.svg)](https://codecov.io/gh/allardvanderouw/connect-ensure-authenticated)
[![dependencies Status](https://david-dm.org/allardvanderouw/connect-ensure-authenticated/status.svg)](https://david-dm.org/allardvanderouw/connect-ensure-authenticated)
[![devDependencies Status](https://david-dm.org/allardvanderouw/connect-ensure-authenticated/dev-status.svg)](https://david-dm.org/allardvanderouw/connect-ensure-authenticated?type=dev)
[![Greenkeeper badge](https://badges.greenkeeper.io/allardvanderouw/connect-ensure-authenticated.svg)](https://greenkeeper.io/)

This simple middleware ensures that a user is logged in with [Passport](https://github.com/jaredhanson/passport). If a request is received that is unauthenticated, the request returns a JSON error.

## Install

Yarn
```
$ yarn add connect-ensure-authenticated
```

NPM
```
$ npm install connect-ensure-authenticated
```

## Usage

#### Ensure Authentication

In this example, an application has a whoami API endpoint. A user must be logged in before accessing this endpoint.

```javascript
const { ensureAuthenticated } = require('connect-ensure-authenticated');
const app = express()

app.get('/api/whoami', ensureAuthenticated(), (req, res) => {
  res.json({ user: req.user });
});
```
      
If a user is not logged in when attempting to access this page, the request will return the default 401 status code with the default message "Authentication required".

#### Unless

This middleware supports [express-unless](https://github.com/jfromaniello/express-unless). This is useful because in some cases it might be better to ensure authentication on all API endpoints with the exception for a few specific API's (for example the login API and the password reset API).

```javascript
const { ensureAuthenticated } = require('connect-ensure-authenticated');
const app = express()

app.use(ensureAuthenticated().unless({
  path: ['/api/login']
}));

// The '/api/login' endpoint is noted in the unless configuration therefore no authentication is required
app.get('/api/login', (req, res) => {
  res.status(200);
  res.json({ authenticationRequired: false });
});

// The '/api/whoami' endpoint is not noted in the unless configuration, therefore authentication is required
app.get('/api/whoami', (req, res) => {
  res.status(200);
  res.json({ authenticationRequired: true });
});
```

The `/api/whoami` endpoint returns an authentication error while the `/api/login` endpoint does not, because it is exluded with unless.

#### Custom status code and/or message

The ensureAuthenticated middleware can be configured to return another status code and/or message.

```javascript
const { ensureAuthenticated } = require('connect-ensure-authenticated');
const app = express()

app.use(ensureAuthenticated({
  statusCode: 418, // default = 401
  message: 'I\'m a teapot!', // default = "Authentication required"
}));
```

#### How do I use this with Passport?

Take a look at the integration test for some inspiration.  
I have also created a single file example repository using this module: https://github.com/allardvanderouw/express-api-passport-local-mongo-session-example/blob/master/server.js

## Prior art

This module was heavily inspired by [Jared Hanson's connect-ensure-login module](https://github.com/jaredhanson/connect-ensure-login).
