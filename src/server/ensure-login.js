'use strict';

module.exports = function(needLogin = true) {
  return function(req, res, next) {
    if( needLogin && !req.isAuthenticated() ||
        !needLogin && req.isAuthenticated() ) {
      return res.status(401).end();
    }
    next();
  };
};
