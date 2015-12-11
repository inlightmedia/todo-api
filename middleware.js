var cryptojs = require('crypto-js');
// Middleware is run before the routes even run so that if the middle ware does not detect authenticatoin it will not call the next function and the other routes will not run

module.exports = function(db) { //if db or database is passed in when this is called then it is available to this function
    return {
        requireAuthentication: function(req, res, next) {
            var token = req.get('Auth') || '';

            db.token.findOne({
                where: {
                    tokenHash: cryptojs.MD5(token).toString()
                }
            }).then(function(tokenInstance) {
                if (!tokenInstance) {
                    throw new Error();
                }
                req.token = tokenInstance;
                return db.user.findByToken(token);
            })
            .then(function (user) {
                req.user = user;
                next();
            })
            .catch(function(e) {
                res.status(401).send();
            });            
        }
    };
};
