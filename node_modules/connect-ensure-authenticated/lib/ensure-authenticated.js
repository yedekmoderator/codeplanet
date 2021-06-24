const unless = require('express-unless');

/**
 * Ensure that a user is logged in before proceeding to next route middleware.
 *
 * This middleware ensures that a user is logged in.  If a request is received
 * that is unauthenticated, the request will return an error message with
 * status code.
 */
const HTTP_STATUS_CODE_UNAUTHORIZED = 401;
const DEFAULT_NOT_AUTHENTICATED_MESSAGE = 'Authentication required';

module.exports = ({
  statusCode = HTTP_STATUS_CODE_UNAUTHORIZED,
  message = DEFAULT_NOT_AUTHENTICATED_MESSAGE,
} = {}) => {
  const ensureAuthenticated = (req, res, next) => {
    // req.isAuthenticated is set by Passport
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      res.status(statusCode);
      res.json({ message });
    } else {
      next();
    }
  };

  ensureAuthenticated.unless = unless;

  return ensureAuthenticated;
};
